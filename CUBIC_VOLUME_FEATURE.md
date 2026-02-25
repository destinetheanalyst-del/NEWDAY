# Cubic Volume Auto-Calculation Feature 📦

## Overview

The NEWDAY Goods Tracking System now **automatically calculates cubic volume** for each parcel item based on its weight and value. This provides shipping professionals with volumetric data crucial for capacity planning and freight pricing.

---

## How It Works

### Automatic Calculation

When registering a parcel item, as soon as you enter:
- **Item Weight (Kg)**
- **Item Value (₦)**

The system **automatically calculates** the **Cubic Volume (m³)** in real-time.

### Calculation Formula

The cubic volume is estimated using weight-to-value density analysis:

```
Volume (m³) = Weight (kg) / Estimated Density (kg/m³)
```

**Estimated Density** is intelligently determined by value density:

| Value Density (₦/kg) | Item Type | Estimated Density | Example |
|---------------------|-----------|-------------------|---------|
| < ₦10,000/kg | Bulky/Low-value | 75 kg/m³ | Furniture, Clothing, Bedding |
| ₦10,000 - ₦100,000/kg | General goods | 150 kg/m³ | Household items, Books, Toys |
| > ₦100,000/kg | Compact/High-value | 250 kg/m³ | Electronics, Jewelry, Phones |

---

## User Experience

### During Item Registration

1. **Enter Item Name** → e.g., "Laptop"
2. **Select Category** → e.g., "Electronics"
3. **Enter Value** → e.g., "450000" (₦450,000)
4. **Enter Weight** → e.g., "2.5" (2.5 Kg)
5. **Cubic Volume Auto-Calculates** → Shows "0.0100 m³"

### Visual Feedback

The cubic volume field:
- ✅ Has a **blue background** to indicate it's auto-calculated
- ✅ Shows **"Auto-calculated"** label
- ✅ Is **read-only** (cannot be manually edited)
- ✅ Uses **monospace font** for easy reading
- ✅ Shows **4 decimal places** for precision
- ✅ Includes explanatory text: "Estimated based on weight and value"

---

## Where Cubic Volume Appears

### 1. Item Registration Form
```
┌──────────────────────────────────────┐
│ Item Weight (Kg)                     │
│ [2.5                            ]    │
├──────────────────────────────────────┤
│ Cubic Volume (m³)  [Auto-calculated] │
│ [0.0100                         ]    │
│ Estimated based on weight and value  │
└──────────────────────────────────────┘
```

### 2. Parcel Details (Official View)
```
┌──────────────────────────────────────┐
│ Item: Laptop         [Electronics]   │
├────────────┬─────────────┬───────────┤
│ Value      │ Weight      │ Volume    │
│ ₦450,000   │ 2.5 Kg     │ 0.0100 m³ │
└────────────┴─────────────┴───────────┘
```

### 3. Bill of Lading Document
```
Description of Goods:
┌──────────────────────────────────────┐
│ Laptop                 [Electronics]  │
│ Quantity: 1                          │
│ Weight: 2.5 Kg                       │
│ Value: ₦450,000                      │
│ Cubic Volume: 0.0100 m³              │
└──────────────────────────────────────┘

Totals:
- Total Weight: 2.50 Kg
- Total Value: ₦450,000.00
- Total Volume: 0.01 m³
```

### 4. Road Manifest Document
```
Cargo Details:
┌──────────────────────────────────────┐
│ Laptop                 [Electronics]  │
│ Weight: 2.5 Kg                       │
│ Value: ₦450,000                      │
│ Cubic Volume: 0.0100 m³              │
└──────────────────────────────────────┘

Totals Summary:
- Total Items: 1
- Total Weight: 2.50 Kg
- Total Value: ₦450,000.00
- Total Volume: 0.01 m³
```

---

## Calculation Examples

### Example 1: Electronics (High Value Density)
```
Item: Smartphone
Value: ₦350,000
Weight: 0.5 Kg
Value Density: ₦350,000 / 0.5 = ₦700,000/kg (> ₦100,000/kg)
→ Estimated Density: 250 kg/m³
→ Volume = 0.5 / 250 = 0.0020 m³
```

### Example 2: Clothing (Low Value Density)
```
Item: Winter Jacket
Value: ₦15,000
Weight: 2 Kg
Value Density: ₦15,000 / 2 = ₦7,500/kg (< ₦10,000/kg)
→ Estimated Density: 75 kg/m³
→ Volume = 2 / 75 = 0.0267 m³
```

### Example 3: Furniture (Very Low Value Density)
```
Item: Office Chair
Value: ₦45,000
Weight: 8 Kg
Value Density: ₦45,000 / 8 = ₦5,625/kg (< ₦10,000/kg)
→ Estimated Density: 75 kg/m³
→ Volume = 8 / 75 = 0.1067 m³
```

### Example 4: General Goods (Medium Value Density)
```
Item: Books (Box)
Value: ₦25,000
Weight: 5 Kg
Value Density: ₦25,000 / 5 = ₦5,000/kg (₦10,000 - ₦100,000/kg)
→ Estimated Density: 150 kg/m³
→ Volume = 5 / 150 = 0.0333 m³
```

---

## Benefits

### For Drivers
- ✅ **No manual calculation** needed
- ✅ **Instant volumetric data** for each item
- ✅ **Professional documentation** with volume metrics
- ✅ **Helps estimate** vehicle space requirements

### For Officials
- ✅ **Quick capacity verification** during inspections
- ✅ **Volumetric weight assessment** for freight pricing
- ✅ **Cargo density analysis** for safety compliance
- ✅ **Complete documentation** with volume records

### For the System
- ✅ **Standardized calculations** across all parcels
- ✅ **Consistent methodology** for volume estimation
- ✅ **Historical data** for capacity planning
- ✅ **Better freight optimization**

---

## Technical Details

### Data Storage

Cubic volume is stored in the `ParcelItem` interface:

```typescript
interface ParcelItem {
  name: string;
  category: string;
  value: string;
  size: string;          // Weight in Kg
  cubicVolume?: string;  // Volume in m³ (optional)
}
```

### Real-Time Calculation

The calculation happens in the `DriverItemDetails` component:

```typescript
const handleItemChange = (index: number, field: keyof Item, value: string) => {
  // ... update field value
  
  // Auto-calculate when weight or value changes
  if (field === 'size' || field === 'value') {
    const weight = parseFloat(weightValue);
    const itemValue = parseFloat(valueValue);
    
    if (weight > 0 && itemValue > 0) {
      const volume = calculateCubicVolume(weight, itemValue);
      newItems[index].cubicVolume = volume.toFixed(4);
    }
  }
};
```

### Precision

- **Input**: Weight (Kg) with up to 2 decimal places
- **Input**: Value (₦) as whole numbers
- **Output**: Volume (m³) with **4 decimal places**

Example: `0.0100 m³` = 10,000 cm³ = 10 liters

---

## Use Cases

### 1. Capacity Planning
Driver can see total volume of all items to ensure they fit in vehicle:
```
Item 1: 0.0100 m³
Item 2: 0.0267 m³
Item 3: 0.0150 m³
---------------
Total: 0.0517 m³ (51.7 liters)
```

### 2. Volumetric Weight
Officials can calculate volumetric weight for air freight:
```
Volumetric Weight = Volume (m³) × Conversion Factor
                  = 0.0517 × 167
                  = 8.63 kg
```

### 3. Cargo Density Analysis
System can flag unusually dense/light cargo:
```
Actual Density = Weight / Volume
               = 2.5 kg / 0.0100 m³
               = 250 kg/m³
✓ Normal for electronics
```

### 4. Freight Pricing
Companies can use volume for dimensional weight pricing:
```
Chargeable Weight = max(Actual Weight, Volumetric Weight)
```

---

## Limitations & Considerations

### ⚠️ Important Notes

1. **Estimation Only**: The calculated volume is an **estimate** based on typical densities, not actual measured dimensions.

2. **No Physical Dimensions**: The system doesn't collect actual length × width × height. It uses weight-to-value ratios as a proxy.

3. **Category Variance**: Items within the same category can have different densities. The system uses averages.

4. **Packaging Not Included**: Calculated volume doesn't account for packaging materials or void fill.

### 💡 Best Practices

- **Use as a Guide**: Treat cubic volume as an estimate for planning purposes
- **Verify Critical Shipments**: For high-value or critical cargo, measure actual dimensions
- **Update Values**: If weight changes, the volume recalculates automatically
- **Consider Packaging**: Add 10-20% for packaging when planning vehicle capacity

---

## Future Enhancements

Potential improvements for the cubic volume feature:

### 📋 Planned
- [ ] Manual dimension input option (L × W × H)
- [ ] More granular density categories
- [ ] Volume in multiple units (m³, cm³, liters)
- [ ] Packaging volume calculator
- [ ] Stackability factor

### 🔄 Under Consideration
- [ ] AI-based density prediction by item name
- [ ] Historical density database
- [ ] Category-specific density refinement
- [ ] Photo-based dimension estimation
- [ ] Integration with freight pricing APIs

---

## Testing the Feature

### Test Case 1: Electronics
```
1. Navigate to Item Registration
2. Enter:
   - Name: Laptop
   - Category: Electronics
   - Value: 450000
   - Weight: 2.5
3. Verify cubic volume appears: ~0.0100 m³
```

### Test Case 2: Furniture
```
1. Add new item
2. Enter:
   - Name: Office Chair
   - Category: Furniture
   - Value: 45000
   - Weight: 8
3. Verify cubic volume appears: ~0.1067 m³
```

### Test Case 3: Multiple Items
```
1. Add 3 different items
2. Submit parcel
3. View confirmation page
4. Check Bill of Lading tab
5. Verify each item shows cubic volume
6. Verify total volume is displayed
```

---

## FAQ

**Q: Why auto-calculate instead of manual input?**  
A: Reduces user effort, ensures consistency, and prevents calculation errors.

**Q: Can I override the calculated volume?**  
A: Currently no. The volume is auto-calculated based on weight and value for consistency.

**Q: Is this accurate for all item types?**  
A: It's an estimation. Actual volumes depend on item shape, packaging, and other factors.

**Q: What if I don't enter weight or value?**  
A: The cubic volume field will show "—" until both weight and value are entered.

**Q: Does this affect freight pricing?**  
A: The system displays volume for reference. Pricing depends on your freight provider's policies.

**Q: Can I see the calculation formula?**  
A: Yes, it's documented in this file under "Calculation Formula" section.

---

## Technical Support

If you encounter issues with cubic volume calculation:

1. **Check Input**: Ensure weight > 0 and value > 0
2. **Verify Browser**: Use modern browser (Chrome, Firefox, Safari, Edge)
3. **Console Logs**: Check browser console for any errors
4. **Test Data**: Try with different weight/value combinations

---

## Summary

✅ **Automatic**: Calculates as you type  
✅ **Intelligent**: Uses value density for accuracy  
✅ **Integrated**: Appears in forms, details, and documents  
✅ **Useful**: Helps with capacity planning and freight pricing  
✅ **Professional**: Provides complete volumetric documentation  

**The cubic volume feature makes NEWDAY a more complete and professional goods tracking solution!**

---

**Last Updated**: February 12, 2026  
**Feature Version**: 1.0.0  
**Status**: ✅ Fully Implemented
