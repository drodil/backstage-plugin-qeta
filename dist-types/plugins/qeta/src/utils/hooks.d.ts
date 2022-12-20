import { QetaApi } from '../api';
export declare function useQetaApi<T>(f: (api: QetaApi) => Promise<T>, deps?: any[]): import("react-use/lib/useAsyncFn").AsyncState<T>;
