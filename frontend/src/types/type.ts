export interface SmokeData {
    No: number;
    StartTime: string; 
    EndTime: string;   
    Done: number;      
    TimeOfSmoke: string; 
  }
  
  export interface SelectedSmoke extends SmokeData {
    imageUrl: string;
  }
  
  export interface FilterSmokeResponse {
    totalRecords: number;
    filteredData: SmokeData[];
    longestSmokeEvent: SmokeData | null;
    totalSmokeTime: string; 
    smokeTimePercentage: string; 
  }
  
  export interface LoadSmokeResponse {
    data: SmokeData | null;
    imageUrl: string;
    todayCount: number;
    smokeStatus: number;
    percentageBlack: number | null; 
  }
  
  export interface DataItem {
    No: number;
    date_time: string;
    Status: string;
    TimeOfSmoke: string;
  }
  
  export interface RatioData {
    data: { name: string; y: number; color: string; }[];
    unit: string;
    title: string;
    titleAlign: string;
    titleSize: string;
    chartSize: string;
    credits: boolean;
    spacingTop: number;
    spacingBottom: number;
    marginTop: number;
  }
  
  export interface SeriesLineOptions {
    type: 'line';
    name: string;
    data: { x: number; y: number }[];
  }
  
  export interface ChartData {
    categories: string[];
    series: SeriesLineOptions[];
  }
  