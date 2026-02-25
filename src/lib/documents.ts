import { ParcelData } from './parcels';

export interface BillOfLading {
  documentType: 'Bill of Lading';
  referenceNumber: string;
  issueDate: string;
  shipper: {
    name: string;
    address: string;
    contact: string;
  };
  consignee: {
    name: string;
    address: string;
    contact: string;
  };
  carrier: {
    driverId: string;
    driverName?: string;
    vehicleNumber?: string;
    vinNumber?: string;
    driverNIN?: string;
    insuranceNumber?: string;
  };
  goods: {
    description: string;
    quantity: number;
    weight: string;
    value: string;
    category: string;
    cubicVolume?: string;
  }[];
  totalValue: string;
  totalWeight: string;
  totalVolume?: string;
  termsAndConditions: string[];
  signatures: {
    shipper: {
      signed: boolean;
      timestamp: string;
    };
    carrier: {
      signed: boolean;
      timestamp: string;
    };
  };
}

export interface RoadManifest {
  documentType: 'Road Manifest';
  referenceNumber: string;
  issueDate: string;
  driver: {
    id: string;
    name?: string;
    vehicleNumber?: string;
    vinNumber?: string;
    driverNIN?: string;
    insuranceNumber?: string;
    driverPhoto?: string;
    licensePhoto?: string;
  };
  route: {
    origin: string;
    destination: string;
  };
  cargo: {
    itemName: string;
    category: string;
    weight: string;
    value: string;
    cubicVolume?: string;
    photo?: string;
    formM?: string;
    nxpNumber?: string;
    hsCode?: string;
    otherDocuments?: Array<{
      name: string;
      data: string;
      type: 'image' | 'pdf';
    }>;
  }[];
  shipper: {
    name: string;
    contact: string;
  };
  consignee: {
    name: string;
    contact: string;
  };
  totalItems: number;
  totalWeight: string;
  totalValue: string;
  totalVolume?: string;
  status: string;
  complianceNotes: string[];
}

export interface ParcelDocuments {
  billOfLading: BillOfLading;
  roadManifest: RoadManifest;
}

/**
 * Generate Bill of Lading document
 */
export const generateBillOfLading = (
  parcel: ParcelData, 
  driverInfo?: {
    name?: string;
    vehicleNumber?: string;
    driverNIN?: string;
    insuranceNumber?: string;
    vinNumber?: string;
  }
): BillOfLading => {
  // Calculate totals
  const totalValue = parcel.items.reduce((sum, item) => {
    const value = parseFloat(item.value.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const totalWeight = parcel.items.reduce((sum, item) => {
    const weight = parseFloat(item.size);
    return sum + (isNaN(weight) ? 0 : weight);
  }, 0);

  const totalVolume = parcel.items.reduce((sum, item) => {
    const volume = parseFloat(item.cubicVolume || '0');
    return sum + (isNaN(volume) ? 0 : volume);
  }, 0);

  const billOfLading: BillOfLading = {
    documentType: 'Bill of Lading',
    referenceNumber: parcel.referenceNumber,
    issueDate: parcel.timestamp,
    shipper: {
      name: parcel.sender.name,
      address: parcel.sender.address,
      contact: parcel.sender.contact,
    },
    consignee: {
      name: parcel.receiver.name,
      address: parcel.receiver.address,
      contact: parcel.receiver.contact,
    },
    carrier: {
      driverId: parcel.driverId,
      driverName: driverInfo?.name,
      vehicleNumber: driverInfo?.vehicleNumber,
      vinNumber: driverInfo?.vinNumber,
      driverNIN: driverInfo?.driverNIN,
      insuranceNumber: driverInfo?.insuranceNumber,
    },
    goods: parcel.items.map((item, index) => ({
      description: item.name,
      quantity: 1,
      weight: `${item.size} Kg`,
      value: `₦${item.value}`,
      category: item.category,
      cubicVolume: item.cubicVolume,
    })),
    totalValue: `₦${totalValue.toFixed(2)}`,
    totalWeight: `${totalWeight.toFixed(2)} Kg`,
    totalVolume: totalVolume > 0 ? `${totalVolume.toFixed(2)} m³` : undefined,
    termsAndConditions: [
      'The carrier shall not be liable for any loss or damage unless caused by negligence.',
      'All goods are carried at owner\'s risk unless otherwise specified.',
      'The consignee must inspect goods upon delivery and report any discrepancies immediately.',
      'Payment terms: COD (Cash on Delivery) unless prior arrangements have been made.',
      'This Bill of Lading is subject to the laws and regulations of Nigeria.',
      'The carrier reserves the right to refuse delivery if proper identification is not provided.',
    ],
    signatures: {
      shipper: {
        signed: true,
        timestamp: parcel.timestamp,
      },
      carrier: {
        signed: true,
        timestamp: parcel.timestamp,
      },
    },
  };

  return billOfLading;
};

/**
 * Generate Road Manifest document
 */
export const generateRoadManifest = (
  parcel: ParcelData, 
  driverInfo?: {
    name?: string;
    vehicleNumber?: string;
    vinNumber?: string;
    driverNIN?: string;
    insuranceNumber?: string;
    driverPhoto?: string;
    licensePhoto?: string;
  }
): RoadManifest => {
  // Calculate totals
  const totalValue = parcel.items.reduce((sum, item) => {
    const value = parseFloat(item.value.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const totalWeight = parcel.items.reduce((sum, item) => {
    const weight = parseFloat(item.size);
    return sum + (isNaN(weight) ? 0 : weight);
  }, 0);

  const totalVolume = parcel.items.reduce((sum, item) => {
    const volume = parseFloat(item.cubicVolume || '0');
    return sum + (isNaN(volume) ? 0 : volume);
  }, 0);

  const roadManifest: RoadManifest = {
    documentType: 'Road Manifest',
    referenceNumber: parcel.referenceNumber,
    issueDate: parcel.timestamp,
    driver: {
      id: parcel.driverId,
      name: driverInfo?.name,
      vehicleNumber: driverInfo?.vehicleNumber,
      vinNumber: driverInfo?.vinNumber,
      driverNIN: driverInfo?.driverNIN,
      insuranceNumber: driverInfo?.insuranceNumber,
      driverPhoto: driverInfo?.driverPhoto,
      licensePhoto: driverInfo?.licensePhoto,
    },
    route: {
      origin: parcel.sender.address,
      destination: parcel.receiver.address,
    },
    cargo: parcel.items.map(item => ({
      itemName: item.name,
      category: item.category,
      weight: `${item.size} Kg`,
      value: `₦${item.value}`,
      cubicVolume: item.cubicVolume,
      photo: item.photo,
      formM: item.formM,
      nxpNumber: item.nxpNumber,
      hsCode: item.hsCode,
      otherDocuments: item.otherDocuments,
    })),
    shipper: {
      name: parcel.sender.name,
      contact: parcel.sender.contact,
    },
    consignee: {
      name: parcel.receiver.name,
      contact: parcel.receiver.contact,
    },
    totalItems: parcel.items.length,
    totalWeight: `${totalWeight.toFixed(2)} Kg`,
    totalValue: `₦${totalValue.toFixed(2)}`,
    totalVolume: totalVolume > 0 ? `${totalVolume.toFixed(2)} m³` : undefined,
    status: parcel.status,
    complianceNotes: [
      'Driver must carry valid driver\'s license and vehicle registration.',
      'All cargo must be properly secured during transport.',
      'Driver must comply with all traffic regulations and road safety guidelines.',
      'Cargo must not be altered, opened, or tampered with during transit.',
      'Driver must report any incidents or accidents immediately.',
      'This manifest must be presented upon request by authorized officials.',
      'Delivery must be made only to the named consignee or authorized representative.',
    ],
  };

  return roadManifest;
};

/**
 * Generate both documents for a parcel
 */
export const generateParcelDocuments = (
  parcel: ParcelData, 
  driverInfo?: {
    name?: string;
    vehicleNumber?: string;
    vinNumber?: string;
    driverNIN?: string;
    insuranceNumber?: string;
    driverPhoto?: string;
    licensePhoto?: string;
  }
): ParcelDocuments => {
  return {
    billOfLading: generateBillOfLading(parcel, driverInfo),
    roadManifest: generateRoadManifest(parcel, driverInfo),
  };
};

/**
 * Format document for display
 */
export const formatDocumentForDisplay = (document: BillOfLading | RoadManifest): string => {
  return JSON.stringify(document, null, 2);
};