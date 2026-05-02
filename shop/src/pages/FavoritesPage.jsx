import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useShop } from '../context/ShopContext';

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { favorites } = useShop();

  if (favorites.length === 0) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">{t('favorites.empty')}</h2>
        <p className="text-gray-500 mb-6">{t('favorites.emptyDesc')}</p>
        <Link to="/catalog" className="btn-primary inline-block">
          {t('nav.catalog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-6 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {t('favorites.title')}
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {favorites.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
