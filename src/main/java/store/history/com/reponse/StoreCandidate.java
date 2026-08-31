package store.history.com.reponse;

import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.Set;

public record StoreCandidate(
        String mngNo, String name, String category,
        String roadAddr, String lotAddr,
        LocalDate permitDate, String statusCd, LocalDateTime srcUpdatedAt
) {
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
            return Optional.of(new StoreCandidate(
                    item.mngNo(), name, item.category(),
                    item.roadAddr(), item.lotAddr(),
                    LocalDate.parse(item.permitDate()),
                    item.statusCd(),
                    LocalDateTime.parse(item.srcUpdatedAt(), TS)
            ));
        } catch (DateTimeParseException e) {
            return Optional.empty();
        }
    }
}