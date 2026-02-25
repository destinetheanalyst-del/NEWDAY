/**
 * Nigeria Trade Traffic HS Code Mapping
 * HS Code (Harmonized System Code) is an internationally standardized system of names and numbers 
 * to classify traded products used by customs authorities around the world.
 */

interface HSCodeMapping {
  [key: string]: string;
}

/**
 * HS Code mapping based on common item categories in Nigeria Trade
 * These are general HS codes - specific products may have more detailed codes
 */
export const hsCodeMapping: HSCodeMapping = {
  electronics: '8517.62.00', // Smartphones and similar devices (commonly traded electronics)
  clothing: '6203.42.00', // Men's or boys' trousers and shorts of cotton
  food: '2106.90.98', // Food preparations not elsewhere specified
  documents: '4820.10.00', // Registers, account books, notebooks, order books, receipt books
  furniture: '9403.60.00', // Other wooden furniture
  other: '9999.99.00', // General/unspecified goods
  // Additional common categories
  textiles: '6302.60.00', // Toilet linen and kitchen linen
  pharmaceuticals: '3004.90.00', // Medicaments (other than goods of heading 30.02, 30.05 or 30.06)
  cosmetics: '3304.99.00', // Beauty or make-up preparations
  machinery: '8479.89.00', // Machines and mechanical appliances having individual functions
  'auto-parts': '8708.99.00', // Parts and accessories of motor vehicles
  books: '4901.99.00', // Printed books, brochures, leaflets and similar printed matter
  toys: '9503.00.90', // Other toys
  shoes: '6403.99.00', // Footwear with outer soles of rubber, plastics, leather
  bags: '4202.22.00', // Handbags with outer surface of plastic sheeting or textile materials
  jewelry: '7113.19.00', // Articles of jewelry and parts thereof, of precious metal
  'sports-equipment': '9506.99.00', // Articles and equipment for general physical exercise
};

/**
 * Get HS Code for a given item category
 * @param category - The item category
 * @returns The corresponding HS Code
 */
export const getHSCode = (category: string): string => {
  const normalizedCategory = category.toLowerCase().trim();
  return hsCodeMapping[normalizedCategory] || hsCodeMapping['other'];
};

/**
 * Get description for HS Code
 * @param hsCode - The HS Code
 * @returns Description of what the HS code represents
 */
export const getHSCodeDescription = (hsCode: string): string => {
  const descriptions: { [key: string]: string } = {
    '8517.62.00': 'Smartphones and similar electronic communication devices',
    '6203.42.00': 'Men\'s or boys\' trousers and shorts of cotton',
    '2106.90.98': 'Food preparations not elsewhere specified',
    '4820.10.00': 'Registers, account books, notebooks, order books, receipt books',
    '9403.60.00': 'Other wooden furniture',
    '9999.99.00': 'General/unspecified goods',
    '6302.60.00': 'Toilet linen and kitchen linen',
    '3004.90.00': 'Medicaments (other than goods of heading 30.02, 30.05 or 30.06)',
    '3304.99.00': 'Beauty or make-up preparations',
    '8479.89.00': 'Machines and mechanical appliances having individual functions',
    '8708.99.00': 'Parts and accessories of motor vehicles',
    '4901.99.00': 'Printed books, brochures, leaflets and similar printed matter',
    '9503.00.90': 'Other toys',
    '6403.99.00': 'Footwear with outer soles of rubber, plastics, leather',
    '4202.22.00': 'Handbags with outer surface of plastic sheeting or textile materials',
    '7113.19.00': 'Articles of jewelry and parts thereof, of precious metal',
    '9506.99.00': 'Articles and equipment for general physical exercise',
  };
  
  return descriptions[hsCode] || 'Trade classification code';
};
