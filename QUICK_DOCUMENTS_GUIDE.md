# Quick Documents Guide 📄

## What Gets Generated?

When you register a parcel, **2 documents** are automatically created:

### 1. Bill of Lading 📄
**Legal transport document**
- Shipper & Consignee details
- Carrier information
- Complete goods description
- Terms & conditions
- Digital signatures

### 2. Road Manifest 🚚
**Transportation compliance document**
- Driver & vehicle info
- Route (origin → destination)
- Cargo details
- Compliance notes
- Official stamp area

---

## How to View Documents

### As a Driver

**After registering a parcel:**

1. See confirmation page with QR code
2. Click tabs below:
   - **QR Info** - What's in the QR code
   - **Bill of Lading** - Legal document
   - **Road Manifest** - Transport manifest

### As an Official

**Option A - Scan QR:**
1. Official App → Scan QR Code
2. Scan parcel QR
3. View Documents section
4. Toggle between documents

**Option B - Track Reference:**
1. Official App → Track Parcel
2. Enter reference (GTS-YYYYMMDD-XXXX)
3. View Documents section
4. Toggle between documents

---

## What's in the QR Code?

The QR code contains the **reference number** which links to:
- Complete parcel details
- Bill of Lading document
- Road Manifest document
- All sender/receiver/item information

**Think of it as**: QR Code → Reference Number → Full Documentation

---

## Bill of Lading Includes

✅ Reference number & date  
✅ Shipper (name, address, contact)  
✅ Consignee (name, address, contact)  
✅ Carrier (driver ID, vehicle number)  
✅ Goods (description, weight, value)  
✅ Totals (total weight, total value)  
✅ Terms & conditions  
✅ Digital signatures with timestamps  

---

## Road Manifest Includes

✅ Reference number & date  
✅ Status (registered/verified/delivered)  
✅ Driver & vehicle info  
✅ Route (origin → destination)  
✅ Shipper & consignee  
✅ Cargo details  
✅ Totals (items, weight, value)  
✅ Compliance notes  
✅ Official stamp area  

---

## Key Points

### Automatic
🤖 Generated automatically on parcel registration  
🤖 No manual creation needed  
🤖 Always complete and accurate  

### Encrypted
🔐 Documents linked to reference number  
🔐 Stored securely in system  
🔐 Only accessible via QR or reference  

### Compliant
✔️ Meets Nigerian transport requirements  
✔️ Legal terms included  
✔️ Digital signatures  
✔️ Compliance notes  

### Accessible
📱 View on driver confirmation page  
📱 Scan QR code to view  
📱 Enter reference to view  
📱 Tabbed interface  

---

## Example Flow

```
1. Driver registers parcel
   └─> System generates:
       - Reference: GTS-20260212-1001
       - Bill of Lading
       - Road Manifest
       
2. QR code created
   └─> Contains: GTS-20260212-1001

3. Official scans QR
   └─> System shows:
       - Parcel details
       - Bill of Lading (tab)
       - Road Manifest (tab)
```

---

## Quick Test

### Test as Driver:
1. Register a parcel
2. View confirmation page
3. Click "Bill of Lading" tab ✓
4. Click "Road Manifest" tab ✓

### Test as Official:
1. Scan parcel QR code
2. Scroll to "Documents" section
3. Toggle between document tabs ✓

---

## Benefits

| Who | Benefit |
|-----|---------|
| **Drivers** | Professional docs auto-created, easy sharing via QR |
| **Officials** | Instant verification, complete cargo info, fast inspections |
| **System** | Standardized, compliant, error-free documentation |

---

## Common Questions

**Q: Where are documents stored?**  
A: In localStorage, linked to the reference number.

**Q: Can I print documents?**  
A: Currently view-only in the app. Print feature coming soon.

**Q: Are documents legally binding?**  
A: Yes, Bill of Lading includes terms and digital signatures.

**Q: What if I lose the QR code?**  
A: Officials can enter the reference number manually.

**Q: Can documents be edited?**  
A: No, they're generated once at registration time.

**Q: Who can view documents?**  
A: Authenticated drivers (their own) and officials (all).

---

**Need More Info?** See `/DOCUMENTS_FEATURE.md` for complete documentation.

**Status**: ✅ Fully Implemented & Ready to Use
