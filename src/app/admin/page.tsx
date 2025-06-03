import dynamicImport from "next/dynamic"; // Renamed import
import { getIsAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // Keep this export to force dynamic rendering

const App = dynamicImport(() => import("./app"), { ssr: false }); // Use renamed import

const AdminPage = async () => {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
        redirect("/");
    }
    return <App />;
};
export default AdminPage;

