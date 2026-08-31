'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Store = {
  mngNo: string;
  name: string;
  category: string;
  roadAddr: string | null;
  permitDate: string;
};

type CategoryMeta = {
  emoji: string;
  chip: string;
  icon: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  한식: {
    emoji: '🍚',
    chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    icon: 'bg-emerald-100 text-emerald-900',
  },
  중국식: {
    emoji: '🥢',
    chip: 'bg-red-50 text-red-800 ring-red-200',
    icon: 'bg-red-100 text-red-900',
  },
  일식: {
    emoji: '🍣',
    chip: 'bg-sky-50 text-sky-800 ring-sky-200',
    icon: 'bg-sky-100 text-sky-900',
  },
  '호프/통닭': {
    emoji: '🍗',
    chip: 'bg-amber-50 text-amber-800 ring-amber-200',
    icon: 'bg-amber-100 text-amber-900',
  },
  '정종/대포집/소주방': {
    emoji: '🍶',
    chip: 'bg-violet-50 text-violet-800 ring-violet-200',
    icon: 'bg-violet-100 text-violet-900',
  },
  경양식: {
    emoji: '🍝',
    chip: 'bg-orange-50 text-orange-800 ring-orange-200',
    icon: 'bg-orange-100 text-orange-900',
  },
  '외국음식전문점(인도,태국등)': {
    emoji: '🌏',
    chip: 'bg-cyan-50 text-cyan-800 ring-cyan-200',
    icon: 'bg-cyan-100 text-cyan-900',
  },
  분식: {
    emoji: '🍜',
    chip: 'bg-pink-50 text-pink-800 ring-pink-200',
    icon: 'bg-pink-100 text-pink-900',
  },
  뷔페식: {
    emoji: '🍽️',
    chip: 'bg-lime-50 text-lime-800 ring-lime-200',
    icon: 'bg-lime-100 text-lime-900',
  },
  횟집: {
    emoji: '🐟',
    chip: 'bg-blue-50 text-blue-800 ring-blue-200',
    icon: 'bg-blue-100 text-blue-900',
  },
  까페: {
    emoji: '☕',
    chip: 'bg-stone-100 text-stone-800 ring-stone-300',
    icon: 'bg-stone-200 text-stone-900',
  },
  패스트푸드: {
    emoji: '🍔',
    chip: 'bg-yellow-50 text-yellow-800 ring-yellow-200',
    icon: 'bg-yellow-100 text-yellow-900',
  },
  '식육(숯불구이)': {
    emoji: '🔥',
    chip: 'bg-rose-50 text-rose-800 ring-rose-200',
    icon: 'bg-rose-100 text-rose-900',
  },
};

const DEFAULT_CATEGORY_META: CategoryMeta = {
  emoji: '🍴',
  chip: 'bg-slate-100 text-slate-800 ring-slate-200',
  icon: 'bg-slate-200 text-slate-900',
};

function formatDate(d: string) {
  const match = d.match(/^(\d{4})-?(\d{2})-?(\d{2})/);

  if (!match) {
    return '날짜 미상';
  }

  return `${Number(match[2])}월 ${Number(match[3])}일`;
}

function dateValue(d: string) {
  const match = d.match(/^(\d{4})-?(\d{2})-?(\d{2})/);

  if (!match) {
    return 0;
  }

  return new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`).getTime();
}

function mapUrl(addr: string | null) {
  if (!addr) return '';
  const base = addr.split(',')[0];
  return 'https://map.naver.com/p/search/' + encodeURIComponent(base);
}

function categoryMeta(category: string) {
  return CATEGORY_META[category] ?? DEFAULT_CATEGORY_META;
}

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [category, setCategory] = useState('전체');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const loadStores = useCallback(async () => {
    setStatus('loading');

    try {
      const response = await fetch('/api/stores', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('API 응답이 올바르지 않습니다.');
      }

      const data: unknown = await response.json();
      setStores(Array.isArray(data) ? (data as Store[]) : []);
      setStatus('ready');
    } catch {
      setStores([]);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadStores();
  }, [loadStores]);

  const categoryCounts = useMemo(() => {
    return stores.reduce((acc, store) => {
      acc.set(store.category, (acc.get(store.category) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());
  }, [stores]);

  const categories = useMemo(() => {
    return ['전체'].concat(
      Array.from(categoryCounts.keys()).sort((a, b) => {
        const countDiff = (categoryCounts.get(b) ?? 0) - (categoryCounts.get(a) ?? 0);
        return countDiff || a.localeCompare(b, 'ko');
      }),
    );
  }, [categoryCounts]);

  useEffect(() => {
    if (category !== '전체' && !categoryCounts.has(category)) {
      setCategory('전체');
    }
  }, [category, categoryCounts]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return stores
      .filter((store) => category === '전체' || store.category === category)
      .filter((store) => {
        if (!keyword) {
          return true;
        }

        return [store.name, store.category, store.roadAddr ?? '']
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      })
      .sort((a, b) => dateValue(b.permitDate) - dateValue(a.permitDate));
  }, [category, query, stores]);

  const newestDate = useMemo(() => {
    return stores.reduce((latest, store) => {
      return dateValue(store.permitDate) > dateValue(latest) ? store.permitDate : latest;
    }, stores[0]?.permitDate ?? '');
  }, [stores]);

  const topCategory = useMemo(() => {
    return Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  }, [categoryCounts]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f5ee] text-[#211f1a]">
      <section className="relative isolate overflow-hidden border-b border-[#ded8ca]">
        <div className="absolute inset-0 -z-10">
          <img
            src="/songpa-restaurant-street.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(248,245,238,0.98) 0%, rgba(248,245,238,0.86) 46%, rgba(248,245,238,0.26) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f8f5ee] to-transparent" />
        </div>

        <div className="mx-auto flex min-h-[410px] max-w-7xl flex-col justify-end px-5 pb-8 pt-20 sm:px-8 lg:min-h-[460px] lg:pb-12">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[#d6c8ac] bg-white/75 px-3 py-1 text-xs font-semibold text-[#7a4d1d] shadow-sm backdrop-blur">
              공공데이터 기반 · 30일 단위 갱신
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-[#211f1a] sm:text-5xl lg:text-6xl">
              송파구에 새로 생긴 식당을 카테고리별로 빠르게 찾아보세요
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#635a4b] sm:text-lg">
              최근 영업 허가 데이터를 불러와 한식, 일식, 분식, 카페 등 관심 있는
              업종만 골라 보고 바로 지도에서 위치를 확인할 수 있습니다.
            </p>

            <dl className="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                <dt className="text-xs font-medium text-[#7a6f5e]">신규 등록</dt>
                <dd className="mt-1 text-2xl font-semibold text-[#211f1a]">
                  {status === 'loading' ? '확인 중' : `${stores.length}곳`}
                </dd>
              </div>
              <div className="rounded-lg border border-white/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                <dt className="text-xs font-medium text-[#7a6f5e]">카테고리</dt>
                <dd className="mt-1 text-2xl font-semibold text-[#211f1a]">
                  {status === 'loading' ? '확인 중' : `${categoryCounts.size}개`}
                </dd>
              </div>
              <div className="rounded-lg border border-white/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                <dt className="text-xs font-medium text-[#7a6f5e]">최근 등록일</dt>
                <dd className="mt-1 text-2xl font-semibold text-[#211f1a]">
                  {newestDate ? formatDate(newestDate) : '-'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:py-10">
        <div className="grid gap-7 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-lg border border-[#e0d8c9] bg-white/85 p-4 shadow-sm">
              <label
                htmlFor="store-search"
                className="text-sm font-semibold text-[#3a352c]"
              >
                음식점 검색
              </label>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#ded6c6] bg-[#fbfaf7] px-3 py-2.5 focus-within:border-[#2f7d57] focus-within:ring-2 focus-within:ring-[#2f7d57]/15">
                <span className="text-sm text-[#948873]" aria-hidden="true">
                  ⌕
                </span>
                <input
                  id="store-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="가게명, 주소로 찾기"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#211f1a] outline-none placeholder:text-[#9a8f7d]"
                />
              </div>
            </div>

            <nav
              aria-label="음식점 카테고리"
              className="rounded-lg border border-[#e0d8c9] bg-white/85 p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-[#3a352c]">카테고리</h2>
                {topCategory && (
                  <span className="text-xs text-[#7a6f5e]">
                    최다 {topCategory[0]} {topCategory[1]}곳
                  </span>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {categories.map((name) => {
                  const count = name === '전체' ? stores.length : categoryCounts.get(name) ?? 0;
                  const isActive = category === name;
                  const meta = categoryMeta(name);

                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setCategory(name)}
                      className={`flex min-w-max items-center justify-between gap-4 rounded-full border px-3.5 py-2.5 text-sm font-semibold transition lg:min-w-0 lg:rounded-lg ${
                        isActive
                          ? 'border-[#2f7d57] bg-[#2f7d57] text-white shadow-sm'
                          : 'border-transparent text-[#5f5648] hover:border-[#ded6c6] hover:bg-[#f8f5ee]'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span aria-hidden="true">
                          {name === '전체' ? '✦' : meta.emoji}
                        </span>
                        <span className="truncate">{name}</span>
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#f1eadf] text-[#7a6f5e]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 border-b border-[#ded8ca] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#7a6f5e]">
                  {category === '전체' ? '전체 신규 음식점' : `${category} 신규 음식점`}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-normal text-[#211f1a]">
                  {status === 'loading' ? '목록을 불러오는 중' : `${filtered.length}곳 표시 중`}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-[#766d5d]">
                인허가일 기준으로 정렬됩니다. 실제 오픈일과 지도 등록 여부는 가게마다
                다를 수 있습니다.
              </p>
            </div>

            {status === 'loading' && (
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-[#e0d8c9] bg-white p-5 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-[#eee6d9]" />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-[#eee6d9]" />
                        <div className="h-3 w-full animate-pulse rounded bg-[#f2ece2]" />
                        <div className="h-3 w-4/5 animate-pulse rounded bg-[#f2ece2]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-8 text-center">
                <h3 className="text-base font-semibold text-red-900">
                  데이터를 불러오지 못했습니다
                </h3>
                <p className="mt-2 text-sm text-red-700">
                  API 서버 주소와 실행 상태를 확인한 뒤 다시 시도해 주세요.
                </p>
                <button
                  type="button"
                  onClick={loadStores}
                  className="mt-5 rounded-full bg-red-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                >
                  다시 불러오기
                </button>
              </div>
            )}

            {status === 'ready' && filtered.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#d9cfbd] bg-white/65 px-5 py-12 text-center">
                <h3 className="text-base font-semibold text-[#3a352c]">
                  조건에 맞는 식당이 없습니다
                </h3>
                <p className="mt-2 text-sm text-[#766d5d]">
                  검색어를 줄이거나 다른 카테고리를 선택해 보세요.
                </p>
              </div>
            )}

            {status === 'ready' && filtered.length > 0 && (
              <ul className="grid gap-3 md:grid-cols-2">
                {filtered.map((store) => {
                  const meta = categoryMeta(store.category);

                  return (
                    <li
                      key={store.mngNo}
                      className="rounded-lg border border-[#e0d8c9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#cfc3af] hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl ${meta.icon}`}
                          aria-hidden="true"
                        >
                          {meta.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="max-w-full break-words text-base font-semibold leading-snug text-[#211f1a]">
                              {store.name}
                            </h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${meta.chip}`}
                            >
                              {store.category}
                            </span>
                          </div>

                          <p className="mt-3 min-h-10 break-words text-sm leading-5 text-[#6d6354]">
                            {store.roadAddr || '주소 정보가 제공되지 않았습니다.'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee7dc] pt-4">
                        <span className="rounded-full bg-[#f6efe5] px-3 py-1 text-xs font-semibold text-[#7a5b30]">
                          {formatDate(store.permitDate)} 등록
                        </span>

                        {store.roadAddr && (
                          <a
                            href={mapUrl(store.roadAddr)}
                            target="_blank"
                            rel="noreferrer"
                            data-gtm="map-click"
                            data-store={store.name}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd8d0] px-3 py-1.5 text-sm font-semibold text-[#236348] transition hover:border-[#2f7d57] hover:bg-[#eef7f2]"
                          >
                            지도 보기
                            <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-5 pb-10 text-xs leading-6 text-[#837967] sm:px-8">
        <p>출처: 행정안전부 지방행정 인허가 데이터</p>
        <p>
          최근 30일 인허가 데이터 기반이며, 실제 개업일과 영업 상태는 현장 상황에 따라
          다를 수 있습니다.
        </p>
      </footer>
    </main>
  );
}
