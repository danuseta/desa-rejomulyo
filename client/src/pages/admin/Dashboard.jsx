// Dashboard.jsx
import { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  HomeIcon,
  UserIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import StatisticTable from '../../components/ui/StatisticTable';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import Swal from 'sweetalert2';

// Component cards
const StatsCard = ({ title, value = 0, icon: Icon, className }) => (
  <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
    <div className="flex items-center">
      <div className={`rounded-full p-2 sm:p-2.5 md:p-3 ${className}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </div>
      <div className="ml-2 sm:ml-3 md:ml-4">
        <h3 className="text-gray-500 text-xs sm:text-sm">{title}</h3>
        <p className="text-base sm:text-lg md:text-2xl font-semibold mt-0.5">{value.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

const GenderCard = ({ data }) => {
  const male = data?.male ?? 0;
  const female = data?.female ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h3 className="text-sm sm:text-base md:text-lg font-medium mb-3 md:mb-4">Berdasarkan Jenis Kelamin</h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        <div className="flex items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
          <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600" />
          <div className="ml-2 sm:ml-3">
            <p className="text-xs sm:text-sm text-gray-500">Laki-laki</p>
            <p className="text-base sm:text-lg md:text-xl font-semibold">{male.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center p-2 sm:p-3 bg-pink-50 rounded-lg">
          <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-pink-600" />
          <div className="ml-2 sm:ml-3">
            <p className="text-xs sm:text-sm text-gray-500">Perempuan</p>
            <p className="text-base sm:text-lg md:text-xl font-semibold">{female.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DusunCard = ({ data = {} }) => (
  <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
    <h3 className="text-sm sm:text-base md:text-lg font-medium mb-3 md:mb-4">Berdasarkan Dusun</h3>
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
      {Object.entries(data || {}).map(([dusun, count]) => (
        <div key={dusun} className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
          <HomeIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-600" />
          <div className="ml-2 sm:ml-3">
            <p className="text-xs sm:text-sm text-gray-500">{dusun}</p>
            <p className="text-base sm:text-lg md:text-xl font-semibold">{(count || 0).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AgeStatistics = ({ data = {} }) => {
  const safeData = data || {};
  
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h3 className="text-sm sm:text-base md:text-lg font-medium mb-3 md:mb-4">Statistik Umur</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {Object.entries(safeData).map(([range, count]) => (
          <div key={range} className="border rounded-lg p-2 sm:p-3 bg-gray-50">
            <p className="text-xs sm:text-sm text-gray-500">{range}</p>
            <p className="text-base sm:text-lg md:text-xl font-semibold mt-1">
              {(count ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatisticsTable = ({ title, data = { dusun: [], rows: [] } }) => (
  <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
    <h3 className="text-sm sm:text-base md:text-lg font-medium mb-3 md:mb-4">{title}</h3>
    <div className="max-w-full -mx-3 sm:mx-0">
      <div className="min-w-full px-3 sm:px-0 overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <StatisticTable data={data} />
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCitizens: 0,
    totalFamilies: 0,
    totalLetters: 0,
    totalTemplates: 0,
    genderStats: { male: 0, female: 0 },
    dusunStats: {},
    ageStats: {}
  });

  const [ageTableData, setAgeTableData] = useState({
    dusun: [],
    rows: []
  });

  const [marriageTableData, setMarriageTableData] = useState({
    dusun: [],
    rows: []
  });

  const [educationTableData, setEducationTableData] = useState({
    dusun: [],
    rows: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        statsRes,
        ageStatsRes,
        dusunStatsRes,
        marriageStatsRes,
        educationStatsRes
      ] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/age-stats'),
        api.get('/dashboard/dusun-stats'),
        api.get('/dashboard/marriage-stats'),
        api.get('/dashboard/education-stats')
      ]);

      setStats({
        ...statsRes.data,
        ageStats: ageStatsRes.data
      });

      setAgeTableData(dusunStatsRes.data);
      setMarriageTableData(marriageStatsRes.data);
      setEducationTableData(educationStatsRes.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data dashboard. Silakan coba lagi nanti.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 sm:p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchDashboardData} variant="primary">Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button onClick={fetchDashboardData} variant="secondary" size="sm">
          Refresh Data
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatsCard
          title="Total Penduduk"
          value={stats.totalCitizens}
          icon={UsersIcon}
          className="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Total KK"
          value={stats.totalFamilies}
          icon={UserGroupIcon}
          className="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Total Surat"
          value={stats.totalLetters}
          icon={DocumentTextIcon}
          className="bg-yellow-100 text-yellow-600"
        />
        <StatsCard
          title="Template Surat"
          value={stats.totalTemplates}
          icon={DocumentDuplicateIcon}
          className="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Gender & Dusun Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <GenderCard data={stats.genderStats} />
        <DusunCard data={stats.dusunStats} />
      </div>

      {/* Age Statistics */}
      <AgeStatistics data={stats.ageStats} />

      {/* Tables */}
      <div className="space-y-4 sm:space-y-6 -mx-4 sm:mx-0">
        <StatisticsTable 
          title="Rekapitulasi Berdasarkan Kelompok Umur" 
          data={ageTableData}
        />
        
        <StatisticsTable 
          title="Rekapitulasi Berdasarkan Status Perkawinan" 
          data={marriageTableData}
        />
        
        <StatisticsTable 
          title="Rekapitulasi Berdasarkan Pendidikan" 
          data={educationTableData}
        />
      </div>

      {/* Summary */}
      {/* <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h3 className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">
              JUMLAH PENDUDUK
            </h3>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-2">
              {stats.totalCitizens.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h3 className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">
              JUMLAH KARTU KELUARGA
            </h3>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-2">
              {stats.totalFamilies.toLocaleString()}
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;