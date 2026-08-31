package store.history.com.reponse;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.*;

// 외부 json을 그대로 받는곳
public record LocalDataResponse(Response response) {

    public record Response(Header header, Body body) {}

    public record Header(String resultCode, String resultMsg) {}

    public record Body(String dataType, int numOfRows, int pageNo, int totalCount,Items items) {}

    public record Items(List<StoreItem> item) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StoreItem(
            @JsonProperty("MNG_NO")           String mngNo,
            @JsonProperty("BPLC_NM")          String name,
            @JsonProperty("BZSTAT_SE_NM")     String category,
            @JsonProperty("ROAD_NM_ADDR")     String roadAddr,
            @JsonProperty("LCPMT_YMD")        String permitDate,
            @JsonProperty("DTL_SALS_STTS_CD") String statusCd,
            @JsonProperty("DAT_UPDT_PNT")     String srcUpdatedAt
    ) {}
}