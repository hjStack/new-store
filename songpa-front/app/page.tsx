'use client';

import { useEffect, useState } from 'react';

type Store = {
  mngNo: string;
  name: string;
  category: string;
  roadAddr: string;
  permitDate: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function formatDate(d: string) {
  const parts = d.split('-');
  return Number(parts[1]) + '월 ' + Number(parts[2]) + '일';
}

function mapUrl(addr: string) {
  const base = addr.split(',')[0];
  return 'https://map.naver.com/p/search/' + encodeURIComponent(base);
}

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [category, setCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API + '/api/stores')
        .then((r) => r.json())
        .then((d) => setStores(d))
        .catch(() => setStores([]))
        .finally(() => setLoading(false));
  }, []);

  const categories = ['전체'].concat(
      Array.from(new Set(stores.map((s) => s.category)))
  );

  const filtered =
      category === '전체' ? stores : stores.filter((s) => s.category === category);

  return (
      <main className="mx-auto max-w-lg px-5 py-12">
        <header>
          <h1 className="text-[22px] font-bold tracking-tight">
            송파구에 새로 생긴 가게
          </h1>
          <p className="mt-1.5 text-[13px] text-gray-500">
            최근 30일간 영업 허가를 받은 음식점
          </p>
        </header>

        <div className="mt-7 flex flex-wrap gap-1.5">
          {categories.map((c) => (
              <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={
                    category === c
                        ? 'rounded-full bg-gray-900 px-3.5 py-1.5 text-[13px] font-medium text-white'
                        : 'rounded-full border border-gray-200 px-3.5 py-1.5 text-[13px] text-gray-600'
                  }
              >
                {c}
              </button>
          ))}
        </div>

        {loading && <p className="mt-10 text-[13px] text-gray-400">불러오는 중</p>}

        {!loading && filtered.length === 0 && (
            <p className="mt-10 text-[13px] text-gray-400">표시할 가게가 없어요.</p>
        )}

        {!loading && filtered.length > 0 && (
            <ul className="mt-7 space-y-3">
              {filtered.map((s) => (
                  <li key={s.mngNo} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-[15px] font-semibold leading-snug">
                        {s.name}
                      </h2>
                      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                  {s.category}
                </span>
                    </div>

                    <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                      {s.roadAddr}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] text-gray-400">
                  {formatDate(s.permitDate)} 등록
                </span>
                      <a
                      href={mapUrl(s.roadAddr)}
                      target="_blank"
                      rel="noreferrer"
                      data-gtm="map-click"
                      data-store={s.name}
                      className="text-[13px] font-medium text-blue-600"
                      >
                      지도에서 위치 보기
                    </a>
                  </div>
                </li>
                ))}
            </ul>
        )}

<footer className="mt-14 space-y-1 text-[11px] leading-relaxed text-gray-400">
  <p>출처: 행정안전부 지방행정 인허가 데이터</p>
  <p>
    인허가일 기준이라 실제 오픈일과 다를 수 있고, 아직 지도에 등록되지 않은
    곳도 있어요.
  </p>
</footer>
</main>
);
}