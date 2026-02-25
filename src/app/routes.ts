import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { DriverSplash } from "./components/driver/DriverSplash";
import { DriverLogin } from "./components/driver/DriverLogin";
import { DriverSignUp } from "./components/driver/DriverSignUp";
import { DriverOTP } from "./components/driver/DriverOTP";
import { DriverHome } from "./components/driver/DriverHome";
import { DriverSenderDetails } from "./components/driver/DriverSenderDetails";
import { DriverItemDetails } from "./components/driver/DriverItemDetails";
import { DriverReceiverDetails } from "./components/driver/DriverReceiverDetails";
import { DriverParcelConfirmation } from "./components/driver/DriverParcelConfirmation";
import { DriverReports } from "./components/driver/DriverReports";

import { OfficialSplash } from "./components/official/OfficialSplash";
import { OfficialLogin } from "./components/official/OfficialLogin";
import { OfficialSignUp } from "./components/official/OfficialSignUp";
import { OfficialOTP } from "./components/official/OfficialOTP";
import { OfficialHome } from "./components/official/OfficialHome";
import { TrackParcel } from "./components/official/TrackParcel";
import { ParcelDetails } from "./components/official/ParcelDetails";

import { AdminSplash } from "./components/admin/AdminSplash";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminDrivers } from "./components/admin/AdminDrivers";
import { AdminOfficials } from "./components/admin/AdminOfficials";
import { AdminItems } from "./components/admin/AdminItems";
import { AdminDocuments } from "./components/admin/AdminDocuments";
import { AdminQRCodes } from "./components/admin/AdminQRCodes";
import { AdminReferences } from "./components/admin/AdminReferences";

import { LandingPage } from "./components/LandingPage";
import { ConnectionTest } from "./components/ConnectionTest";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: "/",
        Component: LandingPage,
      },
      {
        path: "/diagnostics",
        Component: ConnectionTest,
      },
      {
        path: "/driver",
        children: [
          { index: true, Component: DriverSplash },
          { path: "login", Component: DriverLogin },
          { path: "signup", Component: DriverSignUp },
          { path: "otp", Component: DriverOTP },
          { path: "home", Component: DriverHome },
          { path: "reports", Component: DriverReports },
          { path: "register/sender", Component: DriverSenderDetails },
          { path: "register/items", Component: DriverItemDetails },
          { path: "register/receiver", Component: DriverReceiverDetails },
          { path: "confirmation", Component: DriverParcelConfirmation },
          { path: "diagnostics", Component: ConnectionTest },
        ],
      },
      {
        path: "/official",
        children: [
          { index: true, Component: OfficialSplash },
          { path: "login", Component: OfficialLogin },
          { path: "signup", Component: OfficialSignUp },
          { path: "otp", Component: OfficialOTP },
          { path: "home", Component: OfficialHome },
          { path: "track", Component: TrackParcel },
          { path: "details/:id", Component: ParcelDetails },
        ],
      },
      {
        path: "/admin",
        children: [
          { index: true, Component: AdminSplash },
          { path: "login", Component: AdminLogin },
          { path: "dashboard", Component: AdminDashboard },
          { path: "drivers", Component: AdminDrivers },
          { path: "officials", Component: AdminOfficials },
          { path: "items", Component: AdminItems },
          { path: "documents", Component: AdminDocuments },
          { path: "qrcodes", Component: AdminQRCodes },
          { path: "references", Component: AdminReferences },
        ],
      },
    ],
  },
]);