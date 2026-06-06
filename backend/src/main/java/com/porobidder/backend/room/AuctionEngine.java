package com.porobidder.backend.room;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Component;

@Component
public class AuctionEngine {

    public static final long ROUND_DURATION_MS = 20_000;
    public static final long AUTO_ADVANCE_MS = 4_000;

    public void tick(AuctionRoom room) {
        if (room.isFinished()) {
            return;
        }
        if (isAuctionStarted(room) && getCurrentPlayer(room) != null
            && room.getRoundEndsAt() == null && room.getRoundResult() == null) {
            startSealedRound(room);
        }
        if (room.getRoundEndsAt() != null && room.getRoundResult() == null
            && !Instant.now().isBefore(room.getRoundEndsAt())) {
            revealRound(room);
        }
        if (room.getRoundResult() != null && room.getAdvanceAt() != null
            && !Instant.now().isBefore(room.getAdvanceAt())) {
            processRoundEnd(room);
        }
    }

    public void submitBid(AuctionRoom room, String userId, int amount) {
        if (room.isFinished()) {
            throw new IllegalArgumentException("拍卖已结束。");
        }
        if (!isAuctionStarted(room)) {
            throw new IllegalArgumentException("拍卖还没开始。");
        }
        AuctionPlayer player = getCurrentPlayer(room);
        if (player == null || room.getRoundResult() != null || room.getRoundEndsAt() == null) {
            throw new IllegalArgumentException("当前不可出价。");
        }
        if (room.getSealedBids().containsKey(userId)) {
            throw new IllegalArgumentException("本轮已出价。");
        }
        if (amount < 0) {
            throw new IllegalArgumentException("请输入 0 或正整数。");
        }
        if (room.getPhase() == AuctionPhase.FIRST && amount == 0) {
            throw new IllegalArgumentException("第一轮不可 0 元捡漏，请出正价或不点出价。");
        }
        if (amount > 0 && amount < player.getBasePrice()) {
            String zeroHint = room.getPhase() == AuctionPhase.ENCORE ? "出 0 可以捡漏。" : "";
            throw new IllegalArgumentException(
                "正价出价不能低于起拍价 " + player.getBasePrice() + "。" + zeroHint
            );
        }
        if (amount > room.moneyFor(userId)) {
            throw new IllegalArgumentException("出价不能超过你的钱包余额。");
        }
        room.getSealedBids().put(userId, amount);
    }

    public void startNow(AuctionRoom room) {
        if (room.isFinished()) {
            throw new IllegalArgumentException("拍卖已结束。");
        }
        room.setStartAt(Instant.now().minusSeconds(1));
        if (!anyTeamFull(room) && getCurrentPlayer(room) != null
            && room.getRoundEndsAt() == null && room.getRoundResult() == null) {
            startSealedRound(room);
        }
    }

    public boolean isAuctionStarted(AuctionRoom room) {
        return !Instant.now().isBefore(room.getStartAt());
    }

    public AuctionPlayer getCurrentPlayer(AuctionRoom room) {
        if (room.getQueue().isEmpty()) {
            return null;
        }
        return room.getQueue().get(0);
    }

    public boolean anyTeamFull(AuctionRoom room) {
        return room.getTeamA().size() >= AuctionRoom.TEAM_SIZE
            || room.getTeamB().size() >= AuctionRoom.TEAM_SIZE;
    }

    private void startSealedRound(AuctionRoom room) {
        if (room.isFinished() || anyTeamFull(room) || getCurrentPlayer(room) == null) {
            return;
        }
        room.setRoundEndsAt(Instant.now().plusMillis(ROUND_DURATION_MS));
        room.getSealedBids().clear();
        room.setRoundResult(null);
        room.setAdvanceAt(null);
    }

    private void revealRound(AuctionRoom room) {
        AuctionPlayer player = getCurrentPlayer(room);
        if (player == null) {
            return;
        }

        List<RoundResult.BidEntry> bids = new ArrayList<>();
        if (room.getManagerA() != null && room.getSealedBids().containsKey(room.getManagerA())) {
            bids.add(new RoundResult.BidEntry(room.getManagerA(), room.getSealedBids().get(room.getManagerA())));
        }
        if (room.getManagerB() != null && room.getSealedBids().containsKey(room.getManagerB())) {
            bids.add(new RoundResult.BidEntry(room.getManagerB(), room.getSealedBids().get(room.getManagerB())));
        }

        if (bids.isEmpty()) {
            String passText = room.getPhase() == AuctionPhase.FIRST
                ? player.getPlayerId() + " 流拍，第一轮结束后返场（起拍 0 金币）。"
                : player.getPlayerId() + " 流拍，回到队尾。";
            RoundResult result = new RoundResult("pass", passText);
            result.getBids().addAll(bids);
            room.setRoundResult(result);
            scheduleRoundAdvance(room);
            return;
        }

        int highestAmount = bids.stream().mapToInt(RoundResult.BidEntry::amount).max().orElse(0);
        List<RoundResult.BidEntry> winners = bids.stream()
            .filter(bid -> bid.amount() == highestAmount)
            .toList();

        if (winners.size() > 1) {
            String teamKey = pickRandomTeamForAssign(room);
            if (teamKey == null) {
                RoundResult result = new RoundResult("finished", "双方阵容已满，活动结束。");
                result.getBids().addAll(bids);
                room.setRoundResult(result);
                finishAuction(room, "双方阵容已满，活动结束。");
                scheduleRoundAdvance(room);
                return;
            }
            RoundResult.BidEntry payer = winners.get(ThreadLocalRandom.current().nextInt(winners.size()));
            RoundResult result = new RoundResult(
                "tie",
                player.getLabel() + " 同价 " + highestAmount + "，随机加入 "
                    + teamLabel(room, teamKey) + "（由 " + payer.managerId() + " 支付）。"
            );
            result.getBids().addAll(bids);
            result.setTeamKey(teamKey);
            result.setAmount(highestAmount);
            result.setPayerId(payer.managerId());
            room.setRoundResult(result);
            scheduleRoundAdvance(room);
            return;
        }

        RoundResult.BidEntry winner = winners.get(0);
        String teamKey = teamForManager(room, winner.managerId());
        RoundResult result = new RoundResult(
            "sold",
            winner.managerId() + " 以 " + highestAmount + " 金币签下 " + player.getLabel() + "。"
        );
        result.getBids().addAll(bids);
        result.setWinnerId(winner.managerId());
        result.setTeamKey(teamKey);
        result.setAmount(highestAmount);
        room.setRoundResult(result);
        scheduleRoundAdvance(room);
    }

    private void scheduleRoundAdvance(AuctionRoom room) {
        if (room.getAdvanceAt() == null) {
            room.setAdvanceAt(Instant.now().plusMillis(AUTO_ADVANCE_MS));
        }
    }

    private void processRoundEnd(AuctionRoom room) {
        if (room.isFinished()) {
            return;
        }
        RoundResult result = room.getRoundResult();
        AuctionPlayer player = getCurrentPlayer(room);
        if (result == null || player == null) {
            return;
        }

        result.setPlayerSnapshot(player);
        room.setLastRoundResult(copyResult(result));

        switch (result.getType()) {
            case "pass" -> {
                room.getQueue().remove(0);
                if (room.getPhase() == AuctionPhase.FIRST) {
                    player.setBasePrice(0);
                    room.getEncoreQueue().add(player);
                } else {
                    room.getPassedPool().add(player);
                }
            }
            case "sold" -> {
                addPlayerToTeam(room, result.getTeamKey(), player);
                deductMoney(room, result.getWinnerId(), result.getAmount());
                room.getQueue().remove(0);
            }
            case "tie" -> {
                addPlayerToTeam(room, result.getTeamKey(), player);
                deductMoney(room, result.getPayerId(), result.getAmount());
                room.getQueue().remove(0);
            }
            case "finished" -> finishAuction(room, result.getText());
            default -> {
            }
        }

        room.setRoundResult(null);
        room.setAdvanceAt(null);
        room.setRoundEndsAt(null);
        room.getSealedBids().clear();
        room.setRoundNumber(room.getRoundNumber() + 1);

        if (anyTeamFull(room)) {
            finishAuction(room, winningTeamLabel(room) + " 已满 " + AuctionRoom.TEAM_SIZE + " 人，拍卖结束。");
            return;
        }
        if (room.isFinished()) {
            return;
        }

        if (room.getPhase() == AuctionPhase.FIRST && room.getQueue().isEmpty()) {
            beginEncorePhase(room);
        }

        if (room.getQueue().isEmpty()) {
            return;
        }

        if (isAuctionStarted(room)) {
            startSealedRound(room);
        }
    }

    private void beginEncorePhase(AuctionRoom room) {
        if (room.getEncoreQueue().isEmpty()) {
            return;
        }
        room.setPhase(AuctionPhase.ENCORE);
        room.getQueue().addAll(room.getEncoreQueue());
        room.getEncoreQueue().clear();
    }

    private void finishAuction(AuctionRoom room, String reason) {
        room.setFinished(true);
        room.setFinishReason(reason);
        room.setRoundEndsAt(null);
        room.setAdvanceAt(null);
        room.getSealedBids().clear();
        room.setRoundResult(null);
    }

    private String pickRandomTeamForAssign(AuctionRoom room) {
        List<String> slots = new ArrayList<>();
        if (room.getTeamA().size() < AuctionRoom.TEAM_SIZE) {
            slots.add("A");
        }
        if (room.getTeamB().size() < AuctionRoom.TEAM_SIZE) {
            slots.add("B");
        }
        if (slots.isEmpty()) {
            return null;
        }
        return slots.get(ThreadLocalRandom.current().nextInt(slots.size()));
    }

    private void addPlayerToTeam(AuctionRoom room, String teamKey, AuctionPlayer player) {
        List<AuctionPlayer> roster = room.rosterFor(teamKey);
        if (roster.size() < AuctionRoom.TEAM_SIZE) {
            roster.add(player.copy());
        }
    }

    private void deductMoney(AuctionRoom room, String managerId, int amount) {
        room.setMoneyFor(managerId, Math.max(0, room.moneyFor(managerId) - amount));
    }

    private String teamForManager(AuctionRoom room, String managerId) {
        if (managerId != null && managerId.equals(room.getManagerA())) {
            return "A";
        }
        return "B";
    }

    private String teamLabel(AuctionRoom room, String teamKey) {
        if ("A".equals(teamKey)) {
            return labelForManager(room.getManagerA()) + " 队";
        }
        return labelForManager(room.getManagerB()) + " 队";
    }

    private String labelForManager(String managerId) {
        return managerId == null ? "?" : managerId;
    }

    private String winningTeamLabel(AuctionRoom room) {
        if (room.getTeamA().size() >= AuctionRoom.TEAM_SIZE) {
            return labelForManager(room.getManagerA()) + " 队";
        }
        if (room.getTeamB().size() >= AuctionRoom.TEAM_SIZE) {
            return labelForManager(room.getManagerB()) + " 队";
        }
        return "";
    }

    private RoundResult copyResult(RoundResult source) {
        RoundResult copy = new RoundResult(source.getType(), source.getText());
        copy.getBids().addAll(source.getBids());
        copy.setTeamKey(source.getTeamKey());
        copy.setWinnerId(source.getWinnerId());
        copy.setPayerId(source.getPayerId());
        copy.setAmount(source.getAmount());
        copy.setPlayerSnapshot(source.getPlayerSnapshot());
        return copy;
    }
}
