package com.porobidder.backend.room;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AuctionRoom {

    public static final int TEAM_SIZE = 4;
    public static final int STARTING_MONEY = 80;

    private final int activityId;
    private final String title;
    private Instant startAt;
    private AuctionPhase phase = AuctionPhase.FIRST;
    private final List<AuctionPlayer> queue = new ArrayList<>();
    private final List<AuctionPlayer> encoreQueue = new ArrayList<>();
    private final List<AuctionPlayer> passedPool = new ArrayList<>();
    private final List<AuctionPlayer> teamA = new ArrayList<>();
    private final List<AuctionPlayer> teamB = new ArrayList<>();
    private String managerA;
    private String managerB;
    private int moneyA = STARTING_MONEY;
    private int moneyB = STARTING_MONEY;
    private boolean finished;
    private Instant finishedAt;
    private String finishReason;
    private int roundNumber = 1;
    private Instant roundEndsAt;
    private Instant advanceAt;
    private final Map<String, Integer> sealedBids = new LinkedHashMap<>();
    private RoundResult roundResult;
    private RoundResult lastRoundResult;

    public AuctionRoom(int activityId, String title, Instant startAt, List<AuctionPlayer> players) {
        this.activityId = activityId;
        this.title = title;
        this.startAt = startAt;
        this.queue.addAll(players);
    }

    public int getActivityId() {
        return activityId;
    }

    public String getTitle() {
        return title;
    }

    public Instant getStartAt() {
        return startAt;
    }

    public void setStartAt(Instant startAt) {
        this.startAt = startAt;
    }

    public AuctionPhase getPhase() {
        return phase;
    }

    public void setPhase(AuctionPhase phase) {
        this.phase = phase;
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

    public List<AuctionPlayer> getTeamA() {
        return teamA;
    }

    public List<AuctionPlayer> getTeamB() {
        return teamB;
    }

    public String getManagerA() {
        return managerA;
    }

    public void setManagerA(String managerA) {
        this.managerA = managerA;
    }

    public String getManagerB() {
        return managerB;
    }

    public void setManagerB(String managerB) {
        this.managerB = managerB;
    }

    public int getMoneyA() {
        return moneyA;
    }

    public void setMoneyA(int moneyA) {
        this.moneyA = moneyA;
    }

    public int getMoneyB() {
        return moneyB;
    }

    public void setMoneyB(int moneyB) {
        this.moneyB = moneyB;
    }

    public boolean isFinished() {
        return finished;
    }

    public void setFinished(boolean finished) {
        this.finished = finished;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(Instant finishedAt) {
        this.finishedAt = finishedAt;
    }

    public String getFinishReason() {
        return finishReason;
    }

    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    public Instant getRoundEndsAt() {
        return roundEndsAt;
    }

    public void setRoundEndsAt(Instant roundEndsAt) {
        this.roundEndsAt = roundEndsAt;
    }

    public Instant getAdvanceAt() {
        return advanceAt;
    }

    public void setAdvanceAt(Instant advanceAt) {
        this.advanceAt = advanceAt;
    }

    public Map<String, Integer> getSealedBids() {
        return sealedBids;
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

    public boolean isFull() {
        return managerA != null && managerB != null;
    }

    public int managerCount() {
        int count = 0;
        if (managerA != null) {
            count++;
        }
        if (managerB != null) {
            count++;
        }
        return count;
    }

    public String teamForManager(String userId) {
        if (userId != null && userId.equals(managerA)) {
            return "A";
        }
        if (userId != null && userId.equals(managerB)) {
            return "B";
        }
        return null;
    }

    public String opponentFor(String userId) {
        if (userId != null && userId.equals(managerA)) {
            return managerB;
        }
        if (userId != null && userId.equals(managerB)) {
            return managerA;
        }
        return null;
    }

    public int moneyFor(String userId) {
        if (userId != null && userId.equals(managerA)) {
            return moneyA;
        }
        if (userId != null && userId.equals(managerB)) {
            return moneyB;
        }
        return STARTING_MONEY;
    }

    public void setMoneyFor(String userId, int money) {
        if (userId != null && userId.equals(managerA)) {
            moneyA = money;
        } else if (userId != null && userId.equals(managerB)) {
            moneyB = money;
        }
    }

    public List<AuctionPlayer> rosterFor(String teamKey) {
        return "A".equals(teamKey) ? teamA : teamB;
    }
}
