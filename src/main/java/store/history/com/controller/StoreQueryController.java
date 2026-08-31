package store.history.com.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import store.history.com.entity.Store;
import store.history.com.respository.StoreRepository;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreQueryController {

    private final StoreRepository storeRepository;

    @GetMapping
    public List<StoreResponse> list() {
        LocalDate from = LocalDate.now().minusDays(30);
        return storeRepository
                .findRecent(from)
                .stream()
                .map(StoreResponse::from)
                .toList();
    }

    public record StoreResponse(
            String mngNo, String name, String category,
            String roadAddr, String permitDate
    ) {
        static StoreResponse from(Store s) {
            return new StoreResponse(
                    s.getMngNo(), s.getName(), s.getCategory(),
                    s.getRoadAddr(), s.getPermitDate().toString());
        }
    }
}