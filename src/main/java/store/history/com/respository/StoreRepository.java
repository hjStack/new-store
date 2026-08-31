package store.history.com.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import store.history.com.entity.Store;

import java.time.LocalDate;
import java.util.*;

public interface StoreRepository extends JpaRepository<Store, Long> {

    Optional<Store> findByMngNo(String mngNo);

    List<Store> findByPermitDateGreaterThanEqualAndStatusCdOrderByPermitDateDesc(
            LocalDate from, String statusCd);

    @Query("select s from Store s where s.permitDate >= :from and s.statusCd = '01' order by s.permitDate desc")
    List<Store> findRecent(@Param("from") LocalDate from);
}