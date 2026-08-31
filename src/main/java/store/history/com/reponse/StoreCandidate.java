package store.history.com.reponse;

import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.Set;

@Builder
@Slf4j
// 여기서 json -> java object로 변환
// 외부는 string // 여기는 localdatetime
public record StoreCandidate(
        String mngNo, String name, String category,
        String roadAddr, String statusCd, String permitDate,
        LocalDateTime srcUpdatedAt) {
    private static final DateTimeFormatter TS =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final Set<String> EXCLUDED_CATEGORIES = Set.of("기타");

    public static Optional<StoreCandidate> from(LocalDataResponse.StoreItem item) {


        if (!StringUtils.hasText(item.mngNo())
                || !StringUtils.hasText(item.name())
                || !StringUtils.hasText(item.permitDate())
                || !StringUtils.hasText(item.srcUpdatedAt())) {
            return Optional.empty();
        }
        if (!"01".equals(item.statusCd())) {
            return Optional.empty();
        }
        if (EXCLUDED_CATEGORIES.contains(item.category())) {
            return Optional.empty();
        }
        String name = item.name().trim();
        if (name.startsWith("(주)") || name.startsWith("㈜")) {
            return Optional.empty();
        }

        try {
            return Optional.of(new StoreCandidate(item.mngNo(), name, item.category(), item.roadAddr(),
                    item.statusCd(), item.permitDate() , LocalDateTime.parse(item.srcUpdatedAt(), TS)));
        } catch (DateTimeParseException e) {
            return Optional.empty();
        }
    }
}