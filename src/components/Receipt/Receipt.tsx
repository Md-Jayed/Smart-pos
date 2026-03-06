import React, { useEffect, useState } from 'react';
import { TRANSLATIONS } from '../../constants';
import { storageService } from '../../services/storageService';
import { Language } from '../../types';

interface ReceiptProps {
  sale: any;
  language: Language;
}

export default function Receipt({ sale, language }: ReceiptProps) {
  const [storeInfo, setStoreInfo] = useState(storageService.getStoreInfo());
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    setStoreInfo(storageService.getStoreInfo());
  }, []);

  return (
    <div className="receipt font-mono text-xs text-black bg-white p-4 w-[80mm] mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4 flex flex-col items-center">
        {storeInfo.logoUrl && (
          <img src={storeInfo.logoUrl} alt="Logo" className="h-12 w-auto object-contain mb-2" referrerPolicy="no-referrer" />
        )}
        <h2 className="text-lg font-bold uppercase">{storeInfo.name}</h2>
        <h2 className="text-lg font-bold">{storeInfo.nameAr}</h2>
        <p>{storeInfo.address}</p>
        <p>{storeInfo.addressAr}</p>
        <p>CR: {storeInfo.crNumber}</p>
        <p>VAT: {storeInfo.vatNumber}</p>
        <p>Phone: {storeInfo.phone}</p>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-4">
        <div className="flex justify-between">
          <span>Invoice:</span>
          <span>{sale.invoice_number}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date(sale.date).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Method:</span>
          <span className="uppercase">{sale.payment_method}</span>
        </div>
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-1">Item</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">Price</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item: any) => (
            <tr key={item.cartItemId || item.id}>
              <td className="py-1">{item.name}</td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-right py-1">{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-black pt-2 space-y-1">
        <div className="flex justify-between text-base font-bold">
          <span>Total / الإجمالي:</span>
          <span>{sale.total.toFixed(2)} SAR</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Incl. VAT (15%) / شامل الضريبة:</span>
          <span>{sale.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Net Amount / المجموع الفرعي:</span>
          <span>{sale.subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mt-6 pt-4 border-t border-black border-dashed">
        <p className="mb-1">{storeInfo.thankYou}</p>
        <p>{storeInfo.thankYouAr}</p>
      </div>
    </div>
  );
}
