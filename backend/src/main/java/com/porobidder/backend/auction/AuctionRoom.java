package com.porobidder.backend.auction;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class AuctionRoom {

    public static final long CLOSE_DELAY_MS = 30_000;

    private final String stallId;
    private final String title;
    private final int teamSize;
    private final int startingBudget;
    private int managerCount;
    private final List<String> expectedManagers = new CopyOnWriteArrayList<>();

    private final Set<String> presentManagers = ConcurrentHashMap.newKeySet();
    private final Map<String, Integer> money = new ConcurrentHashMap<>();
    private final Map<String, List<AuctionPlayer>> teams = new ConcurrentHashMap<>();

    private final List<AuctionPlayer> queue = new CopyOnWriteArrayList<>();
    private final List<AuctionPlayer> encoreQueue = new CopyOnWriteArrayList<>();
    private final List<AuctionPlayer> passedPool = new CopyOnWriteArrayList<>();

    private AuctionPhase phase = AuctionPhase.FIRST;
    private boolean auctionStarted;
    private boolean finished;
    private String finishReason;

    private AuctionPlayer currentPlayer;
    private int roundNumber;
    private long roundEndsAtEpochMs;
    private boolean roundOpen;
    private final Map<String, Integer> pendingBids = new ConcurrentHashMap<>();
    private final List<String> pendingBidOrder = new CopyOnWriteArrayList<>();
    private RoundResult roundResult;
    private RoundResult lastRoundResult;
    private long autoAdvanceAtEpochMs;
    private long closesAtEpochMs;

    public AuctionRoom(
        String stallId,
        String title,
        int teamSize,
        int startingBudget,
        int managerCount,
        List<String> expectedManagers,
        List<AuctionPlayer> initialQueue
    ) {
        this.stallId = stallId;
        this.title = title;
        this.teamSize = teamSize;
        this.startingBudget = startingBudget;
        this.managerCount = managerCount;
        syncExpectedManagers(expectedManagers, startingBudget);
        this.queue.addAll(initialQueue);
    }

    public void syncExpectedManagers(List<String> managerIds, int budget) {
        for (String managerId : managerIds) {
            if (!expectedManagers.contains(managerId)) {
                expectedManagers.add(managerId);
            }
            teams.putIfAbsent(managerId, new ArrayList<>());
            money.putIfAbsent(managerId, budget);
        }

        List<String> staleManagers = expectedManagers.stream()
            .filter((managerId) -> !managerIds.contains(managerId))
            .toList();
        for (String managerId : staleManagers) {
            expectedManagers.remove(managerId);
            teams.remove(managerId);
            money.remove(managerId);
            presentManagers.remove(managerId);
        }
    }

    public void scheduleClose() {
        if (closesAtEpochMs == 0) {
            closesAtEpochMs = System.currentTimeMillis() + CLOSE_DELAY_MS;
        }
    }

    public String getStallId() {
        return stallId;
    }

    public String getTitle() {
        return title;
    }

    public int getTeamSize() {
        return teamSize;
    }

    public int getStartingBudget() {
        return startingBudget;
    }

    public int getManagerCount() {
        return managerCount;
    }

    public void setManagerCount(int managerCount) {
        this.managerCount = managerCount;
    }

    public List<String> getExpectedManagers() {
        return expectedManagers;
    }

    public Set<String> getPresentManagers() {
        return presentManagers;
    }

    public Map<String, Integer> getMoney() {
        return money;
    }

    public Map<String, List<AuctionPlayer>> getTeams() {
        return teams;
    }

    public List<AuctionPlayer> getQueue() {
        return queue;
    }

    public List<AuctionPlayer> getEncoreQueue() {
        return encoreQueue;
    }

    public List<AuctionPlayer> getPassedPool() {
        return passedPool;
    }

    public AuctionPhase getPhase() {
        return phase;
    }

    public void setPhase(AuctionPhase phase) {
        this.phase = phase;
    }

    public boolean isAuctionStarted() {
        return auctionStarted;
    }

    public void setAuctionStarted(boolean auctionStarted) {
        this.auctionStarted = auctionStarted;
    }

    public boolean isFinished() {
        return finished;
    }

    public void setFinished(boolean finished) {
        this.finished = finished;
    }

    public String getFinishReason() {
        return finishReason;
    }

    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
    }

    public AuctionPlayer getCurrentPlayer() {
        return currentPlayer;
    }

    public void setCurrentPlayer(AuctionPlayer currentPlayer) {
        this.currentPlayer = currentPlayer;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    public long getRoundEndsAtEpochMs() {
        return roundEndsAtEpochMs;
    }

    public void setRoundEndsAtEpochMs(long roundEndsAtEpochMs) {
        this.roundEndsAtEpochMs = roundEndsAtEpochMs;
    }

    public boolean isRoundOpen() {
        return roundOpen;
    }

    public void setRoundOpen(boolean roundOpen) {
        this.roundOpen = roundOpen;
    }

    public Map<String, Integer> getPendingBids() {
        return pendingBids;
    }

    public List<String> getPendingBidOrder() {
        return pendingBidOrder;
    }

    public void recordBid(String managerId, int amount) {
        pendingBids.put(managerId, amount);
        if (!pendingBidOrder.contains(managerId)) {
            pendingBidOrder.add(managerId);
        }
    }

    public void clearPendingBids() {
        pendingBids.clear();
        pendingBidOrder.clear();
    }

    public RoundResult getRoundResult() {
        return roundResult;
    }

    public void setRoundResult(RoundResult roundResult) {
        this.roundResult = roundResult;
    }

    public RoundResult getLastRoundResult() {
        return lastRoundResult;
    }

    public void setLastRoundResult(RoundResult lastRoundResult) {
        this.lastRoundResult = lastRoundResult;
    }

    public long getAutoAdvanceAtEpochMs() {
        return autoAdvanceAtEpochMs;
    }

    public void setAutoAdvanceAtEpochMs(long autoAdvanceAtEpochMs) {
        this.autoAdvanceAtEpochMs = autoAdvanceAtEpochMs;
    }

    public long getClosesAtEpochMs() {
        return closesAtEpochMs;
    }

    public void clearRoundState() {
        clearPendingBids();
        roundResult = null;
        roundOpen = false;
        roundEndsAtEpochMs = 0;
        autoAdvanceAtEpochMs = 0;
    }

    public boolean isTeamFull(String managerId) {
        return teams.getOrDefault(managerId, List.of()).size() >= teamSize;
    }

    public int countTeamsNotFull() {
        return (int) teams.keySet().stream().filter((managerId) -> !isTeamFull(managerId)).count();
    }

    public boolean shouldEndAuction() {
        return countTeamsNotFull() <= 1;
    }

    public List<AuctionPlayer> mergedPassedPool() {
        if (finished) {
            List<AuctionPlayer> merged = new ArrayList<>(passedPool);
            merged.addAll(encoreQueue);
            merged.addAll(queue);
            return merged;
        }
        if (phase == AuctionPhase.ENCORE) {
            return List.copyOf(passedPool);
        }
        List<AuctionPlayer> merged = new ArrayList<>(passedPool);
        merged.addAll(encoreQueue);
        return merged;
    }

    public Map<String, List<AuctionPlayer>> snapshotTeams() {
        Map<String, List<AuctionPlayer>> copy = new LinkedHashMap<>();
        for (Map.Entry<String, List<AuctionPlayer>> entry : teams.entrySet()) {
            copy.put(entry.getKey(), List.copyOf(entry.getValue()));
        }
        return copy;
    }
}
