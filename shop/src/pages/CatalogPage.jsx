import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FluentEmoji from '../components/FluentEmoji';
import { findCategoryById, findSubcategoryById } from '../data/products';
import { USED_GRADE_STYLES } from '../data/usedGradeStyles';
import { useAdminData } from '../context/AdminDataContext';
import { shuffleBySubcategory } from '../utils/productShuffle';

export default function CatalogPage() {
  const { t, i18n } = useTranslation();
  const { products, loading, visibleCategories } = useAdminData();
  // Sidebar uchun: faqat mahsulot bor kategoriyalar
  const categories = visibleCategories;
  const [searchParams, setSearchParams] = useSearchParams();

  const initCategory = searchParams.get('category') || 'all';
  const initSubcategory = searchParams.get('subcategory') || '';
  const initQuery = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState(initCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(initSubcategory);
  const [searchQuery, setSearchQuery] = useState(initQuery);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  const lang = i18n.language;

  // URL ni yangilash
  useEffect(() => {
    const params = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (activeSubcategory) params.subcategory = activeSubcategory;
    if (searchQuery) params.q = searchQuery;
    setSearchParams(params, { replace: true });
  }, [activeCategory, activeSubcategory, searchQuery, setSearchParams]);

  // URL searchParams o'zgarganda (header'dagi link bosilganda) — state'ni yangilash
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const sub = searchParams.get('subcategory') || '';
    const q = searchParams.get('q') || '';
    if (cat !== activeCategory) setActiveCategory(cat);
    if (sub !== activeSubcategory) setActiveSubcategory(sub);
    if (q !== searchQuery) setSearchQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Subcategory tanlanganida — uning ota-kategoriyasini ham aniqlash
  useEffect(() => {
    if (activeSubcategory) {
      const sub = findSubcategoryById(activeSubcategory);
      if (sub && sub.parent.id !== activeCategory) {
        setActiveCategory(sub.parent.id);
      }
    }
  }, [activeSubcategory]);

  const currentCategory = activeCategory !== 'all' ? findCategoryById(activeCategory) : null;
  const currentSubcategory = activeSubcategory ? findSubcategoryById(activeSubcategory) : null;

  // Filtrlash — faqat zaxirada bor mahsulotlar
  const filtered = useMemo(() => {
    const base = products
      .filter(p => p.stock > 0)
      .filter(p => activeCategory === 'all' || p.category === activeCategory)
      .filter(p => !activeSubcategory || p.subcategory === activeSubcategory)
      .filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.name[lang].toLowerCase().includes(q) ||
               p.description[lang].toLowerCase().includes(q);
      });

    if (sortBy === 'price-asc') return [...base].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...base].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return [...base].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));

    // sortBy === 'popular' (default). "Barcha mahsulotlar" tanlangan
    // va qidiruv/subkategoriya filteri yo'q bo'lsa — subkategoriyalar
    // bo'yicha aralashtirib chiqaramiz (turli bo'limlar almashinib).
    if (activeCategory === 'all' && !activeSubcategory && !searchQuery) {
      return shuffleBySubcategory(base);
    }
    return base;
  }, [products, activeCategory, activeSubcategory, searchQuery, sortBy, lang]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setActiveSubcategory(''); // Subcategory'ni reset qilamiz
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4 overflow-x-auto pb-1">
        <Link to="/" className="hover:text-primary-600 whitespace-nowrap">{t('nav.home')}</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link to="/catalog" className="hover:text-primary-600 whitespace-nowrap">{t('nav.catalog')}</Link>
        {currentCategory && (
          <>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{currentCategory.name[lang]}</span>
          </>
        )}
        {currentSubcategory && (
          <>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-gray-900 font-medium whitespace-nowrap">{currentSubcategory.name[lang]}</span>
          </>
        )}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-1">
        {currentSubcategory
          ? currentSubcategory.name[lang]
          : currentCategory
            ? currentCategory.name[lang]
            : t('products.all')}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {filtered.length} {t('products.items')}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
              />
            </div>

            {/* Categories tree */}
            <div className="card p-4">
              <h3 className="font-semibold text-sm mb-3">{t('nav.categories')}</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                    activeCategory === 'all' ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50'
                  }`}
                >
                  {t('products.all')}
                </button>
                {categories.map(cat => (
                  <div key={cat.id}>
                    <button
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${
                        activeCategory === cat.id ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50'
                      }`}
                    >
                      <img src={cat.icon} alt="" className="w-5 h-5 object-contain" />
                      <span className="flex-1 truncate">{cat.name[lang]}</span>
                    </button>
                    {/* Subcategories - faqat aktiv kategoriya uchun */}
                    {activeCategory === cat.id && (
                      <div className="ml-6 mt-1 space-y-0.5 animate-fade-in">
                        {cat.subcategories.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setActiveSubcategory(activeSubcategory === sub.id ? '' : sub.id)}
                            className={`w-full text-left px-2 py-1 rounded-md text-xs transition-colors flex items-center justify-between gap-2 ${
                              activeSubcategory === sub.id ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <span className="truncate">{sub.name[lang]}</span>
                            {sub.discount && (
                              <span className="text-[10px] font-bold text-green-600 flex-shrink-0">−{sub.discount}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div>
          {/* Mobile - search + filter button */}
          <div className="lg:hidden mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Mobile category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'all' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'
                }`}
              >
                {t('products.all')}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeCategory === cat.id ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'
                  }`}
                >
                  <img src={cat.icon} alt="" className="w-4 h-4 object-contain" />
                  {cat.name[lang]}
                </button>
              ))}
            </div>

            {/* Subcategory pills - faqat kategoriya tanlanganida */}
            {currentCategory && (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {currentCategory.subcategories.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubcategory(activeSubcategory === sub.id ? '' : sub.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                      activeSubcategory === sub.id ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
                    }`}
                  >
                    {sub.name[lang]}
                    {sub.discount && (
                      <span className="text-[10px] font-bold text-green-600">−{sub.discount}</span>
                    )}
                    {activeSubcategory === sub.id && <X className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subcategory description banner (B/U holati va h.k.) */}
          {currentSubcategory?.description && (() => {
            const s = USED_GRADE_STYLES[currentSubcategory.id];
            return (
              <div className={`mb-4 p-3 rounded-lg border flex items-start gap-2.5 ${s?.container || 'border-gray-200 bg-gray-50'}`}>
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${s?.iconBg || 'bg-gray-500 text-white'}`}>
                  {s?.letter || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm flex items-center gap-2 flex-wrap ${s?.title || 'text-gray-900'}`}>
                    {currentSubcategory.name[lang]}
                    {currentSubcategory.discount && (
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${s?.discount || 'text-gray-700 bg-gray-100'}`}>
                        −{currentSubcategory.discount}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs mt-0.5 ${s?.body || 'text-gray-700'}`}>
                    {currentSubcategory.description[lang]}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Sort */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              {filtered.length} {t('products.items')}
            </span>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500"
              >
                <option value="popular">{t('sort.popular')}</option>
                <option value="price-asc">{t('sort.priceAsc')}</option>
                <option value="price-desc">{t('sort.priceDesc')}</option>
                <option value="rating">{t('sort.rating')}</option>
              </select>
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="mb-4 flex justify-center"><FluentEmoji name="search" size={56} /></div>
              <p className="text-lg font-medium mb-1">{t('products.notFound')}</p>
              <p className="text-sm">{t('products.notFoundDesc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 justify-items-center">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} variant="catalog" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
