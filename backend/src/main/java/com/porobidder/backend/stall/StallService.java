package com.porobidder.backend.stall;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.porobidder.backend.auction.AuctionService;
import com.porobidder.backend.stall.dto.JoinStallRequest;
import com.porobidder.backend.stall.dto.PlayerLotDto;
import com.porobidder.backend.stall.dto.SaveStallRequest;
import com.porobidder.backend.stall.dto.StallDto;

@Service
public class StallService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter ISO_FORMAT = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    private static final Set<String> GAME_IDS = Set.of("lol", "dota2", "cs2");

    private final StallRepository stallRepository;
    private final StallPlayerLotRepository lotRepository;
    private final StallJoinRepository joinRepository;
    private final AuctionService auctionService;

    public StallService(
        StallRepository stallRepository,
        StallPlayerLotRepository lotRepository,
        StallJoinRepository joinRepository,
        @Lazy AuctionService auctionService
    ) {
        this.stallRepository = stallRepository;
        this.lotRepository = lotRepository;
        this.joinRepository = joinRepository;
        this.auctionService = auctionService;
    }

    public List<StallDto> listVendorStalls(String vendorId, String gameId) {
        List<Stall> stalls = gameId == null || gameId.isBlank()
            ? stallRepository.findByVendorIdOrderByCreatedAtDesc(vendorId)
            : stallRepository.findByVendorIdAndGameIdOrderByCreatedAtDesc(vendorId, normalizeGameId(gameId));
        return stalls.stream().map(this::toDto).toList();
    }

    public StallDto getVendorStall(String vendorId, String stallId) {
        Stall stall = requireOwnedStall(vendorId, stallId);
        return toDto(stall);
    }

    @Transactional
    public StallDto createStall(String vendorId, SaveStallRequest request) {
        validateSaveRequest(request, true);

        LocalDateTime now = LocalDateTime.now();
        String stallId = UUID.randomUUID().toString();
        Stall stall = new Stall(
            stallId,
            vendorId,
            normalizeGameId(request.gameId()),
            normalizeTitle(request.roomName()),
            request.managerCount(),
            request.teamSize(),
            request.startingBudget(),
            false,
            null,
            now,
            now
        );
        stallRepository.save(stall);
        replaceLots(stallId, request.players(), now);
        return toDto(stall);
    }

    @Transactional
    public StallDto updateStall(String vendorId, String stallId, SaveStallRequest request) {
        Stall stall = requireOwnedStall(vendorId, stallId);
        LocalDateTime now = LocalDateTime.now();

        if (request.roomName() != null) {
            stall.setTitle(normalizeTitle(request.roomName()));
        }
        if (request.gameId() != null) {
            stall.setGameId(normalizeGameId(request.gameId()));
        }
        if (request.managerCount() != null) {
            if (request.managerCount() < 2) {
                throw new IllegalArgumentException("STALL_INVALID_MANAGER_COUNT");
            }
            stall.setManagerCount(request.managerCount());
        }
        if (request.teamSize() != null) {
            stall.setTeamSize(request.teamSize());
        }
        if (request.startingBudget() != null) {
            stall.setStartingBudget(request.startingBudget());
        }
        if (request.isOpen() != null) {
            boolean nextOpen = request.isOpen();
            if (nextOpen && countActivePlayers(stallId) == 0) {
                throw new IllegalArgumentException("STALL_NO_PLAYERS");
            }
            if (nextOpen && stall.getInviteCode() == null) {
                stall.setInviteCode(generateUniqueInviteCode());
            }
            stall.setOpen(nextOpen);
        }
        if (request.players() != null) {
            replaceLots(stallId, request.players(), now);
        }

        stall.setUpdatedAt(now);
        stallRepository.save(stall);
        if (stall.isOpen()) {
            auctionService.refreshJoinedManagers(stallId);
        }
        return toDto(stall);
    }

    @Transactional
    public void closeAfterAuction(String stallId) {
        stallRepository.findById(stallId).ifPresent((stall) -> {
            stall.setOpen(false);
            stall.setInviteCode(null);
            stall.setUpdatedAt(LocalDateTime.now());
            stallRepository.save(stall);
        });
        joinRepository.deleteByStallId(stallId);
    }

    @Transactional
    public void deleteStall(String vendorId, String stallId) {
        Stall stall = requireOwnedStall(vendorId, stallId);
        lotRepository.deleteByStallId(stallId);
        stallRepository.delete(stall);
    }

    public List<StallDto> listOpenStalls(String gameId) {
        String normalizedGameId = normalizeGameId(gameId);
        return stallRepository.findByOpenTrueAndGameIdOrderByUpdatedAtDesc(normalizedGameId).stream()
            .filter((stall) -> countActivePlayers(stall.getStallId()) > 0)
            .map(this::toDto)
            .toList();
    }

    public List<StallDto> listManagerJoinedStalls(String managerId, String gameId) {
        List<String> stallIds = joinRepository.findByManagerId(managerId).stream()
            .map(StallJoin::getStallId)
            .toList();
        if (stallIds.isEmpty()) {
            return List.of();
        }

        return stallRepository.findAllById(stallIds).stream()
            .filter((stall) -> gameId == null || gameId.isBlank() || stall.getGameId().equals(normalizeGameId(gameId)))
            .map(this::toDto)
            .toList();
    }

    @Transactional
    public StallDto joinByInviteCode(String managerId, JoinStallRequest request) {
        String code = normalizeInviteCode(request.inviteCode());
        if (code.isEmpty()) {
            throw new IllegalArgumentException("INVITE_CODE_INVALID");
        }

        Stall stall = stallRepository.findByInviteCodeIgnoreCaseAndOpenTrue(code)
            .orElseThrow(() -> new IllegalArgumentException("INVITE_CODE_INVALID"));

        if (request.stallId() != null && !request.stallId().isBlank()
            && !stall.getStallId().equals(request.stallId())) {
            throw new IllegalArgumentException("INVITE_CODE_MISMATCH");
        }
        if (request.gameId() != null && !request.gameId().isBlank()
            && !stall.getGameId().equals(normalizeGameId(request.gameId()))) {
            throw new IllegalArgumentException("INVITE_CODE_WRONG_GAME");
        }
        if (joinRepository.existsByStallIdAndManagerId(stall.getStallId(), managerId)) {
            throw new IllegalArgumentException("ALREADY_JOINED");
        }
        if (joinRepository.countByStallId(stall.getStallId()) >= stall.getManagerCount()) {
            throw new IllegalArgumentException("ROOM_FULL");
        }
        if (countActivePlayers(stall.getStallId()) == 0) {
            throw new IllegalArgumentException("STALL_NO_PLAYERS");
        }

        joinRepository.save(new StallJoin(stall.getStallId(), managerId, LocalDateTime.now()));
        auctionService.refreshJoinedManagers(stall.getStallId());
        return toDto(stall);
    }

    private Stall requireOwnedStall(String vendorId, String stallId) {
        return stallRepository.findByStallIdAndVendorId(stallId, vendorId)
            .orElseThrow(() -> new IllegalArgumentException("STALL_NOT_FOUND"));
    }

    private void replaceLots(String stallId, List<PlayerLotDto> players, LocalDateTime now) {
        lotRepository.deleteByStallId(stallId);
        if (players == null || players.isEmpty()) {
            return;
        }

        List<StallPlayerLot> entities = new ArrayList<>();
        for (int i = 0; i < players.size(); i += 1) {
            PlayerLotDto lot = players.get(i);
            String lotId = lot.lotId() == null || lot.lotId().isBlank()
                ? UUID.randomUUID().toString()
                : lot.lotId();
            entities.add(new StallPlayerLot(
                lotId,
                stallId,
                safe(lot.playerId()),
                safe(lot.rank()),
                lot.startingBid() > 0 ? lot.startingBid() : 1,
                lot.enabled(),
                i,
                GameProfileSupport.toJson(lot),
                now,
                now
            ));
        }
        lotRepository.saveAll(entities);
    }

    private long countActivePlayers(String stallId) {
        return lotRepository.findByStallIdOrderBySortOrderAsc(stallId).stream()
            .filter((lot) -> lot.isEnabled() && !lot.getPlayerId().isBlank())
            .count();
    }

    private StallDto toDto(Stall stall) {
        List<PlayerLotDto> players = lotRepository.findByStallIdOrderBySortOrderAsc(stall.getStallId()).stream()
            .map(GameProfileSupport::mergeProfile)
            .toList();
        return new StallDto(
            stall.getStallId(),
            stall.getVendorId(),
            stall.getGameId(),
            stall.getTitle(),
            stall.getManagerCount(),
            stall.getTeamSize(),
            stall.getStartingBudget(),
            players,
            stall.isOpen(),
            stall.getInviteCode(),
            formatInstant(stall.getCreatedAt()),
            formatInstant(stall.getUpdatedAt())
        );
    }

    private String generateUniqueInviteCode() {
        String code;
        do {
            code = InviteCodeSupport.generate();
        } while (stallRepository.existsByInviteCodeIgnoreCase(code));
        return code;
    }

    private void validateSaveRequest(SaveStallRequest request, boolean creating) {
        if (creating) {
            if (request.roomName() == null || request.roomName().isBlank()) {
                throw new IllegalArgumentException("STALL_TITLE_REQUIRED");
            }
            if (request.gameId() == null || request.gameId().isBlank()) {
                throw new IllegalArgumentException("STALL_GAME_REQUIRED");
            }
            if (request.managerCount() == null || request.managerCount() < 2) {
                throw new IllegalArgumentException("STALL_INVALID_MANAGER_COUNT");
            }
            if (request.teamSize() == null || request.teamSize() < 1) {
                throw new IllegalArgumentException("STALL_INVALID_TEAM_SIZE");
            }
            if (request.startingBudget() == null || request.startingBudget() < 1) {
                throw new IllegalArgumentException("STALL_INVALID_BUDGET");
            }
        }
    }

    private String normalizeGameId(String gameId) {
        if (gameId == null) {
            throw new IllegalArgumentException("STALL_GAME_REQUIRED");
        }
        String normalized = gameId.trim().toLowerCase(Locale.ROOT);
        if (!GAME_IDS.contains(normalized)) {
            throw new IllegalArgumentException("STALL_GAME_INVALID");
        }
        return normalized;
    }

    private String normalizeTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("STALL_TITLE_REQUIRED");
        }
        return title.trim();
    }

    private String normalizeInviteCode(String code) {
        if (code == null) {
            return "";
        }
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String formatInstant(LocalDateTime time) {
        return time.atZone(ZONE).format(ISO_FORMAT);
    }
}
