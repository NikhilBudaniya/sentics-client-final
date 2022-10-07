import './FixImport'
import './App.css';
import {
    Routes,
    Route,
} from "react-router-dom";
import Dashboard from './components/Dashboard';
import Analytics from './components/analytics/Analytics';
import LiveData from './components/LiveData/LiveData';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useDispatch} from 'react-redux';
import {WindowWidth} from './state/reducers/WindowWidthReducer';
import {Connector} from "mqtt-react-hooks";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            networkMode: "always", // fetch data even when there is no internet connection
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    const dispatch = useDispatch();

    window.addEventListener('resize', () => {
        let windowInnerWidth = window.innerWidth;
        if (windowInnerWidth > 1280) {
            dispatch(WindowWidth({value: windowInnerWidth - 250}))
        } else if (windowInnerWidth > 640) {
            dispatch(WindowWidth({value: windowInnerWidth - 50}))
        } else {
            dispatch(WindowWidth({value: windowInnerWidth}))
        }
    })

    return (
        <QueryClientProvider client={queryClient}>
            <Connector brokerUrl="ws://broker.emqx.io" options={{ username: "emqx", password: "public", clientId: 'test21414', path: '/mqtt', port: 8083 }}>
                <Routes>
                    <Route path="/" element={<Dashboard/>}>
                        <Route path="" element={<LiveData/>}/>
                        <Route path="/analytics/*" element={<Analytics/>}/>
                    </Route>
                    <Route path="*" element={<>Page not </>}/>
                </Routes>
            </Connector>
        </QueryClientProvider>
    );
}

export default App;
