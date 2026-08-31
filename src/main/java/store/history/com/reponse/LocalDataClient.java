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
    private static final String BASE_URL = "https://apis.data.go.kr/1741000/general_restaurants/info";

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
        String url = BASE_URL
                + "?serviceKey=" + authKey
                + "&pageNo=" + pageNo
                + "&numOfRows=" + numOfRows
                + "&returnType=json"
                + "&cond[OPN_ATMY_GRP_CD::EQ]=" + localCode
                + "&cond[SALS_STTS_CD::EQ]=01"
                + "&cond[LCPMT_YMD::GTE]=" + permitDateFrom.format(YMD);

        URI uri = URI.create(url);

        LocalDataResponse res = restClient.get().uri(uri).retrieve().body(LocalDataResponse.class);

        return res;
    }
}