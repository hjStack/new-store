package store.history.com.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Table(name = "batch_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BatchStatus status;

    /** 이번 배치가 읽어들인 원본의 최신 DAT_UPDT_PNT — 다음 실행의 시작점 */
    @Column(name = "last_src_updated_at")
    private LocalDateTime lastSrcUpdatedAt;

    @Column(name = "fetched_count")
    private int fetchedCount;

    @Column(name = "saved_count")
    private int savedCount;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    public static BatchHistory start() {
        BatchHistory h = new BatchHistory();
        h.startedAt = LocalDateTime.now();
        h.status = BatchStatus.RUNNING;
        return h;
    }

    public void success(int fetched, int saved, LocalDateTime lastSrcUpdatedAt) {
        this.status = BatchStatus.SUCCESS;
        this.fetchedCount = fetched;
        this.savedCount = saved;
        this.lastSrcUpdatedAt = lastSrcUpdatedAt;
    }

    public void fail(String message) {
        this.status = BatchStatus.FAILED;
        this.errorMessage = message;
        this.finishedAt = LocalDateTime.now();
    }
}

