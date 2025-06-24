import Layout from "./components/app/layout";
import Navbar from "./components/app/navbar";
import { AppProvider } from "./lib/providers/app";
import UserProvider from "./lib/providers/user";

function App() {
    return (
        <AppProvider>
            <UserProvider>
                <div className="h-screen flex flex-col overflow-hidden">
                    <Navbar />
                    <Layout />
                </div>
            </UserProvider>
        </AppProvider>
    );
}

export default App;
