package com.porobidder.backend.auction;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class AuctionEngine {

    public static final long ROUND_DURATION_MS = 20_000;
    public static final long AUTO_ADVANCE_MS = 7_000;

    private static final String FINISH_ONLY_ONE_SLOT_LEFT = "仅余一组未满，拍卖结束。";

    public void tick(AuctionRoom room) {
        synchronized (room) {
            tickWithinLock(room);
        }
    }

    public void submitBid(AuctionRoom room, String managerId, int amount) {
        synchronized (room) {
            submitBidWithinLock(room, managerId, amount);
            if (room.getPendingBids().size() >= room.getPresentManagers().size()) {
                tickWithinLock(room);
            }
        }
    }

    private void tickWithinLock(AuctionRoom room) {
        if (room.isFinished()) {
            return;
        }

        if (!room.isAuctionStarted()) {
            return;
        }

        if (room.getRoundResult() != null) {
            if (System.currentTimeMillis() >= room.getAutoAdvanceAtEpochMs()) {
                advanceAfterResult(room);
            }
            return;
        }

        if (!room.isRoundOpen()) {
            startRound(room);
            return;
        }

        if (allPresentManagersBid(room) || System.currentTimeMillis() >= room.getRoundEndsAtEpochMs()) {
            revealRound(room);
        }
    }

    private void submitBidWithinLock(AuctionRoom room, String managerId, int amount) {
        if (!room.isAuctionStarted() || room.isFinished()) {
            throw new IllegalArgumentException("拍卖尚未开始或已结束。");
        }
        if (!room.getPresentManagers().contains(managerId)) {
            throw new IllegalArgumentException("你尚未进入拍卖房间。");
        }
        if (!room.isRoundOpen() || room.getRoundResult() != null) {
            throw new IllegalArgumentException("当前不可出价。");
        }
        if (room.getPendingBids().containsKey(managerId)) {
            throw new IllegalArgumentException("你已提交本轮出价。");
        }

        AuctionPlayer player = room.getCurrentPlayer();
        if (player == null) {
            throw new IllegalArgumentException("当前没有待拍选手。");
        }

        int minBid = room.getPhase() == AuctionPhase.FIRST ? Math.max(1, player.getBasePrice()) : 0;
        if (amount < minBid) {
            throw new IllegalArgumentException("出价低于最低要求。");
        }
        if (amount > room.getMoney().getOrDefault(managerId, 0)) {
            throw new IllegalArgumentException("余额不足。");
        }

        room.recordBid(managerId, amount);
    }

    public boolean tryStartAuction(AuctionRoom room) {
        if (room.isAuctionStarted() || room.isFinished()) {
            return false;
        }
        if (room.getExpectedManagers().size() < room.getManagerCount()) {
            return false;
        }
        if (!room.getPresentManagers().containsAll(room.getExpectedManagers())) {
            return false;
        }
        room.setAuctionStarted(true);
        return true;
    }

    private void startRound(AuctionRoom room) {
        if (room.isRoundOpen() || room.getCurrentPlayer() != null) {
            return;
        }

        if (room.shouldEndAuction()) {
            finishAuction(room, FINISH_ONLY_ONE_SLOT_LEFT);
            return;
        }

        if (room.getQueue().isEmpty()) {
            if (!room.getEncoreQueue().isEmpty()) {
                room.getQueue().addAll(room.getEncoreQueue());
                room.getEncoreQueue().clear();
                room.setPhase(AuctionPhase.ENCORE);
            } else {
                finishAuction(room, "选手已拍完。");
                return;
            }
        }

        if (room.shouldEndAuction()) {
            finishAuction(room, FINISH_ONLY_ONE_SLOT_LEFT);
            return;
        }

        AuctionPlayer next = room.getQueue().remove(0);
        room.setCurrentPlayer(next);
        room.setRoundNumber(room.getRoundNumber() + 1);
        room.setRoundOpen(true);
        room.setRoundEndsAtEpochMs(System.currentTimeMillis() + ROUND_DURATION_MS);
        room.clearPendingBids();
    }

    private void revealRound(AuctionRoom room) {
        room.setRoundOpen(false);

        AuctionPlayer player = room.getCurrentPlayer();
        if (player == null) {
            return;
        }

        List<RoundResult.BidEntry> bidEntries = orderedBidEntries(room);

        if (bidEntries.isEmpty()) {
            handlePass(room, player, bidEntries, "本轮无人出价，选手流拍。");
            return;
        }

        int maxAmount = bidEntries.stream().mapToInt(RoundResult.BidEntry::amount).max().orElse(0);
        List<RoundResult.BidEntry> topBids = bidEntries.stream()
            .filter((bid) -> bid.amount() == maxAmount)
            .toList();

        if (topBids.size() == 1) {
            String winnerId = topBids.get(0).managerId();
            int winningBid = topBids.get(0).amount();
            if (room.isTeamFull(winnerId)) {
                handlePass(room, player, bidEntries, winnerId + " 队伍已满，选手流拍。");
                return;
            }
            assignWinner(room, player, winnerId, winningBid, bidEntries,
                winnerId + " 以 " + winningBid + " 金币签下 " + player.getPlayerId() + "。");
            return;
        }

        String winnerId = firstEligibleTiedBidder(room, maxAmount);
        if (winnerId == null) {
            handlePass(room, player, bidEntries, "同价经理队伍均已满，选手流拍。");
            return;
        }

        assignWinner(room, player, winnerId, maxAmount, bidEntries,
            "同价优先最早出价，" + winnerId + " 以 " + maxAmount + " 金币签下 " + player.getPlayerId() + "。");
    }

    private String firstEligibleTiedBidder(AuctionRoom room, int maxAmount) {
        for (String managerId : room.getPendingBidOrder()) {
            Integer amount = room.getPendingBids().get(managerId);
            if (amount != null && amount == maxAmount && !room.isTeamFull(managerId)) {
                return managerId;
            }
        }
        return null;
    }

    private List<RoundResult.BidEntry> orderedBidEntries(AuctionRoom room) {
        List<RoundResult.BidEntry> bidEntries = new ArrayList<>();
        for (String managerId : room.getPendingBidOrder()) {
            Integer amount = room.getPendingBids().get(managerId);
            if (amount != null) {
                bidEntries.add(new RoundResult.BidEntry(managerId, amount));
            }
        }
        return bidEntries;
    }

    private void assignWinner(
        AuctionRoom room,
        AuctionPlayer player,
        String winnerId,
        int winningBid,
        List<RoundResult.BidEntry> bidEntries,
        String text
    ) {
        room.getMoney().put(winnerId, room.getMoney().get(winnerId) - winningBid);
        room.getTeams().computeIfAbsent(winnerId, key -> new ArrayList<>()).add(player.copy());

        RoundResult result = new RoundResult("sold", text, bidEntries, player.copy());
        room.setLastRoundResult(result);
        room.setRoundResult(result);
        room.setAutoAdvanceAtEpochMs(System.currentTimeMillis() + AUTO_ADVANCE_MS);

        if (room.shouldEndAuction()) {
            finishAfterResult(room, FINISH_ONLY_ONE_SLOT_LEFT);
        }
    }

    private void handlePass(
        AuctionRoom room,
        AuctionPlayer player,
        List<RoundResult.BidEntry> bidEntries,
        String text
    ) {
        AuctionPlayer snapshot = player.copy();
        if (room.getPhase() == AuctionPhase.FIRST) {
            AuctionPlayer encorePlayer = player.copy();
            encorePlayer.setBasePrice(0);
            room.getEncoreQueue().add(encorePlayer);
        } else {
            room.getPassedPool().add(player.copy());
        }

        RoundResult result = new RoundResult("pass", text, bidEntries, snapshot);
        room.setLastRoundResult(result);
        room.setRoundResult(result);
        room.setAutoAdvanceAtEpochMs(System.currentTimeMillis() + AUTO_ADVANCE_MS);
    }

    private void finishAfterResult(AuctionRoom room, String reason) {
        markFinished(room, reason);
    }

    private void finishAuction(AuctionRoom room, String reason) {
        markFinished(room, reason);
    }

    private void markFinished(AuctionRoom room, String reason) {
        room.setFinished(true);
        room.setFinishReason(reason);
        room.scheduleClose();
    }

    private void advanceAfterResult(AuctionRoom room) {
        room.setCurrentPlayer(null);
        room.setRoundResult(null);
        room.setRoundOpen(false);
        room.setRoundEndsAtEpochMs(0);
        room.setAutoAdvanceAtEpochMs(0);
        room.clearPendingBids();

        if (room.isFinished()) {
            return;
        }

        if (room.shouldEndAuction()) {
            finishAuction(room, FINISH_ONLY_ONE_SLOT_LEFT);
            return;
        }

        if (room.getQueue().isEmpty() && room.getEncoreQueue().isEmpty()) {
            finishAuction(room, "选手已拍完。");
            return;
        }

        startRound(room);
    }

    private boolean allPresentManagersBid(AuctionRoom room) {
        return room.getPresentManagers().stream()
            .allMatch((managerId) -> room.getPendingBids().containsKey(managerId));
    }
}
