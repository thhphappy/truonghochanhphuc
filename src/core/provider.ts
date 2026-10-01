import { mockProvider } from '../providers/mockProvider';
import { DataProvider } from './dataProvider';

// Export provider mặc định trỏ về mockProvider theo yêu cầu
export const dataProvider: DataProvider = mockProvider;
export default dataProvider;
