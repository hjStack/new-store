package store.history.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import store.history.com.service.StoreCollectService;

@RestController
@RequiredArgsConstructor
public class storeController {

    private final StoreCollectService collectService;

    @PostMapping("/dev/collect")
    public String collect() {
        collectService.collect();
        return "ok";
    }
}
