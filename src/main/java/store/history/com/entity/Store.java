package store.history.com.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "store",
        indexes = @Index(name = "idx_store_permit_date", columnList = "permit_date DESC")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mng_no", nullable = false, unique = true, length = 50)
    private String mngNo;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 50)
    private String category;

    @Column(name = "road_addr", length = 500)
    private String roadAddr;

    @Column(name = "lot_addr", length = 500)
    private String lotAddr;

    @Column(name = "permit_date", nullable = false)
    private LocalDate permitDate;

    @Column(name = "status_cd", nullable = false, length = 10)
    private String statusCd;

    @Column(name = "src_updated_at", nullable = false)
    private LocalDateTime srcUpdatedAt;

    @Builder
    private Store(String mngNo, String name, String category, String roadAddr,
                  String lotAddr, LocalDate permitDate, String statusCd,
                  LocalDateTime srcUpdatedAt) {
        this.mngNo = mngNo;
        this.name = name;
        this.category = category;
        this.roadAddr = roadAddr;
        this.lotAddr = lotAddr;
        this.permitDate = permitDate;
        this.statusCd = statusCd;
        this.srcUpdatedAt = srcUpdatedAt;
    }

    /** 이미 저장된 건이 원본에서 갱신됐을 때 (상호 변경, 폐업 등) */
    public void update(String name, String category, String roadAddr,
                       String statusCd, LocalDateTime srcUpdatedAt) {
        this.name = name;
        this.category = category;
        this.roadAddr = roadAddr;
        this.statusCd = statusCd;
        this.srcUpdatedAt = srcUpdatedAt;
    }
}