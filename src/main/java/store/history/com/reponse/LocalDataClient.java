package store.history.com.reponse;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class LocalDataClient {

    private static final DateTimeFormatter YMD = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final RestClient restClient;
    private final String authKey;
    private final String localCode;

    public LocalDataClient(RestClient restClient,
                           @Value("${local-data.auth-key}") String authKey,
                           @Value("${local-data.local-code}") String localCode) {
        this.restClient = restClient;
        this.authKey = authKey;
        this.localCode = localCode;
    }


    public LocalDataResponse fetch(int pageNo, int numOfRows, LocalDate permitDateFrom) {

        String url = "https://apis.data.go.kr/1741000/general_restaurants/history"
                + "?serviceKey=" + authKey
                + "&pageNo=" + pageNo
                + "&numOfRows=" + numOfRows
                + "&returnType=json"
                + "&cond[OPN_ATMY_GRP_CD::EQ]=" + localCode
                + "&cond[SALS_STTS_CD::EQ]=01"
                + "&cond[LCPMT_YMD::GTE]=" + permitDateFrom.format(YMD);

        URI uri = UriComponentsBuilder.fromUriString(url).build().toUri();

        System.out.println("key=" + URLEncoder.encode(authKey, StandardCharsets.UTF_8).substring(0, 20));

        return restClient.get().uri(uri).retrieve().body(LocalDataResponse.class);
    }
}