-- Update domain pricing with Alpha.net.bd prices
-- These are competitive Bangladeshi market prices

UPDATE domain_pricing SET 
  base_price = 1795,
  renewal_price = 1840,
  transfer_price = 1795
WHERE tld = '.com';

UPDATE domain_pricing SET 
  base_price = 2190,
  renewal_price = 2665,
  transfer_price = 2190
WHERE tld = '.net';

UPDATE domain_pricing SET 
  base_price = 2020,
  renewal_price = 2065,
  transfer_price = 2020
WHERE tld = '.org';

UPDATE domain_pricing SET 
  base_price = 750,
  renewal_price = 4485,
  transfer_price = 4015
WHERE tld = '.info';

UPDATE domain_pricing SET 
  base_price = 2595,
  renewal_price = 2595,
  transfer_price = 2595
WHERE tld = '.biz';

UPDATE domain_pricing SET 
  base_price = 5610,
  renewal_price = 5610,
  transfer_price = 5610
WHERE tld = '.online';

UPDATE domain_pricing SET 
  base_price = 8775,
  renewal_price = 8775,
  transfer_price = 8775
WHERE tld = '.store';

UPDATE domain_pricing SET 
  base_price = 4500,
  renewal_price = 4500,
  transfer_price = 4500
WHERE tld = '.tech';

UPDATE domain_pricing SET 
  base_price = 5500,
  renewal_price = 6000,
  transfer_price = 5500
WHERE tld = '.io';

UPDATE domain_pricing SET 
  base_price = 3500,
  renewal_price = 3500,
  transfer_price = 3500
WHERE tld = '.co';

UPDATE domain_pricing SET 
  base_price = 1200,
  renewal_price = 1400,
  transfer_price = 1200
WHERE tld = '.xyz';

-- Add new TLDs from Alpha.net.bd
INSERT INTO domain_pricing (tld, base_price, renewal_price, transfer_price, margin_percent, currency, is_active, is_popular, sort_order)
VALUES 
  ('.name', 1475, 1815, 1500, 5, 'BDT', true, false, 16),
  ('.asia', 2200, 2700, 2200, 5, 'BDT', true, false, 17),
  ('.mobi', 4850, 5855, 4850, 5, 'BDT', true, false, 18),
  ('.news', 4510, 5350, 4510, 5, 'BDT', true, false, 19),
  ('.live', 4510, 5350, 4510, 5, 'BDT', true, false, 20)
ON CONFLICT (tld) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  renewal_price = EXCLUDED.renewal_price,
  transfer_price = EXCLUDED.transfer_price;