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
          <span className="uppercase">
            {sale.payment_method === 'split' 
              ? (isRTL ? 'مقسم (نقدي + بطاقة)' : 'Split (Cash + Card)')
              : sale.payment_method}
          </span>
        </div>
        {sale.payment_method === 'split' && (
          <>
            <div className="flex justify-between text-[10px] pl-4">
              <span>- {isRTL ? 'نقداً' : 'Cash'}:</span>
              <span>{sale.cash_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] pl-4">
              <span>- {isRTL ? 'بطاقة' : 'Card'}:</span>
              <span>{sale.card_amount?.toFixed(2)}</span>
            </div>
          </>
        )}
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
          {sale.items.map((item: any) => {
            const itemSubtotal = item.price * item.quantity;
            let discountedPrice = itemSubtotal;
            let discountDisplay = '';
            
            if (item.discountValue) {
              if (item.discountType === 'percentage') {
                discountedPrice = itemSubtotal * (1 - item.discountValue / 100);
                discountDisplay = `(-${item.discountValue}%)`;
              } else {
                discountedPrice = Math.max(0, itemSubtotal - item.discountValue);
                discountDisplay = `(-${item.discountValue.toFixed(2)})`;
              }
            }

            return (
              <React.Fragment key={item.cartItemId || item.id}>
                <tr>
                  <td className="py-1">{item.name}</td>
                  <td className="text-center py-1">{item.quantity}</td>
                  <td className="text-right py-1">{itemSubtotal.toFixed(2)}</td>
                </tr>
                {item.discountValue && (
                  <tr className="text-[10px] italic">
                    <td colSpan={2} className="pb-1 pl-2">
                      {isRTL ? 'خصم' : 'Discount'} {discountDisplay}
                    </td>
                    <td className="text-right pb-1">
                      -{(itemSubtotal - discountedPrice).toFixed(2)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
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
        <p className="mb-4">{storeInfo.thankYouAr}</p>
        
        <div className="pt-4 border-t border-black border-dotted text-[10px] space-y-1">
          <p>Exchange or Return within 2 days</p>
          <p>الاستبدال أو الاسترجاع خلال يومين</p>
          <p className="pt-2">Please keep this receipt</p>
          <p>يرجى الاحتفاظ بالفاتورة</p>
        </div>
      </div>
    </div>
  );
}
