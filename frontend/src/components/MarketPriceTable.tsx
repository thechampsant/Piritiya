import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency, formatDate } from '../utils/i18n';
import type { Language } from '../types';

interface MarketPrice {
  cropName: string;
  price: number; // Price per quintal in rupees
  market: string;
  date: number; // Timestamp
  unit?: string;
}

interface MarketPriceTableProps {
  prices: MarketPrice[];
  language: Language;
}

/**
 * MarketPriceTable - Displays market prices in table format
 * Requirements: 11.3, 11.6
 */
const MarketPriceTable: React.FC<MarketPriceTableProps> = ({
  prices,
  language,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-cream/5 border border-gold/20 rounded-lg p-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-cream mb-4">
        {t('marketPrices')}
      </h3>

      {/* Table */}
      {prices.length === 0 ? (
        <p className="text-cream/60 text-center py-4">
          {language === 'hi' ? 'कोई बाजार भाव उपलब्ध नहीं है' : 'No market prices available'}
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gold/20">
                <th className="text-left py-3 px-2 text-cream/70 font-semibold text-sm">
                  {language === 'hi' ? 'फसल' : 'Crop'}
                </th>
                <th className="text-right py-3 px-2 text-cream/70 font-semibold text-sm">
                  {language === 'hi' ? 'भाव' : 'Price'}
                </th>
                <th className="text-left py-3 px-2 text-cream/70 font-semibold text-sm">
                  {language === 'hi' ? 'बाजार' : 'Market'}
                </th>
                <th className="text-right py-3 px-2 text-cream/70 font-semibold text-sm">
                  {language === 'hi' ? 'तारीख' : 'Date'}
                </th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price, index) => (
                <tr
                  key={index}
                  className="border-b border-gold/10 last:border-0 hover:bg-cream/5 transition-colors"
                >
                  {/* Crop Name */}
                  <td className="py-3 px-2 text-cream text-base">
                    {price.cropName}
                  </td>

                  {/* Price */}
                  <td className="py-3 px-2 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-cream font-semibold text-base">
                        {formatCurrency(price.price, language)}
                      </span>
                      <span className="text-cream/50 text-xs">
                        /{price.unit || t('quintals')}
                      </span>
                    </div>
                  </td>

                  {/* Market */}
                  <td className="py-3 px-2 text-cream/80 text-sm">
                    {price.market}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-2 text-right text-cream/60 text-xs">
                    {formatDate(price.date, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile-friendly Card View (shown on small screens) */}
      {prices.length > 0 && (
        <div className="md:hidden space-y-3 mt-4">
          {prices.map((price, index) => (
            <div
              key={index}
              className="bg-cream/5 border border-gold/15 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-cream font-semibold text-base">
                  {price.cropName}
                </h4>
                <div className="text-right">
                  <div className="text-cream font-bold text-lg">
                    {formatCurrency(price.price, language)}
                  </div>
                  <div className="text-cream/50 text-xs">
                    /{price.unit || t('quintals')}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cream/70">
                  {price.market}
                </span>
                <span className="text-cream/60 text-xs">
                  {formatDate(price.date, language)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketPriceTable;
