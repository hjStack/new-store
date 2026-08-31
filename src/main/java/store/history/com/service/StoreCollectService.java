package store.history.com.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import store.history.com.entity.BatchHistory;
import store.history.com.entity.Store;
import store.history.com.reponse.LocalDataClient;
import store.history.com.reponse.StoreCandidate;
import store.history.com.respository.BatchHistoryRepository;
import store.history.com.respository.StoreRepository;


import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreCollectService {

    private static final int PAGE_SIZE = 100;
    private static final int MAX_PAGES = 10;      // 폭주 방지 상한
    private static final int COLLECT_DAYS = 30;

    private final LocalDataClient client;
    private final StoreRepository storeRepository;
    private final BatchHistoryRepository historyRepository;

    @Transactional
    public void collect() {
        BatchHistory history = historyRepository.save(BatchHistory.start());
        LocalDate cutoff = LocalDate.now().minusDays(COLLECT_DAYS);

        int fetched = 0, saved = 0;
        LocalDateTime maxSrcUpdatedAt = null;

        try {
            for (int page = 1; page <= MAX_PAGES; page++) {
                var body = client.fetch(page, PAGE_SIZE, cutoff).response().body();
                var items = body.items().item();
                if (items == null || items.isEmpty()) break;

                for (var item : items) {
                    fetched++;

                    var candidate = StoreCandidate.from(item).orElse(null);
                    if (candidate == null) continue;

                    if (upsert(candidate)) saved++;

                    if (maxSrcUpdatedAt == null
                            || candidate.srcUpdatedAt().isAfter(maxSrcUpdatedAt)) {
                        maxSrcUpdatedAt = candidate.srcUpdatedAt();
                    }
                }

                if (items.size() < PAGE_SIZE) break;
            }

            history.success(fetched, saved, maxSrcUpdatedAt);
            log.info("수집 완료 fetched={} saved={}", fetched, saved);

        } catch (Exception e) {
            history.fail(e.getMessage());
            log.error("수집 실패", e);
            throw e;
        }
    }

    private boolean upsert(StoreCandidate c) {
        return storeRepository.findByMngNo(c.mngNo())
                .map(existing -> {
                    if (!existing.getSrcUpdatedAt().isBefore(c.srcUpdatedAt())) {
                        return false;   // 이미 최신이면 건너뜀
                    }
                    existing.update(c.name(), c.category(), c.roadAddr(), c.statusCd(), c.srcUpdatedAt());
                    return true;
                })
                .orElseGet(() -> {
                    storeRepository.save(Store.builder()
                            .mngNo(c.mngNo()).name(c.name()).category(c.category())
                            .permitDate(LocalDate.parse(c.permitDate())).statusCd(c.statusCd())
                            .srcUpdatedAt(c.srcUpdatedAt())
                            .build());
                    return true;
                });
    }
}