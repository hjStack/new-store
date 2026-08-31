package store.history.com.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import store.history.com.entity.BatchHistory;
import store.history.com.entity.BatchStatus;
import java.util.*;

public interface BatchHistoryRepository extends JpaRepository<BatchHistory, Long> {
    Optional<BatchHistory> findTopByStatusOrderByStartedAtDesc(BatchStatus status);
}