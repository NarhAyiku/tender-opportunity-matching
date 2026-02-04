import { useEffect, useState } from 'react';
import { swipesApi } from '../api';
import { AppLayout } from '../components/layout';
import { Card, Spinner } from '../components/common';
import { Swipe } from '../types';
import { Building2, Trash2 } from 'lucide-react';

export function SavedPage() {
  const [saved, setSaved] = useState<Swipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const swipes = await swipesApi.getSaved();
        setSaved(swipes);
      } catch (error) {
        console.error('Failed to fetch saved:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleRemove = async (id: number) => {
    try {
      await swipesApi.deleteSwipe(id);
      setSaved(saved.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to remove:', error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Saved</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : saved.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🔖</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Nothing saved yet
              </h2>
              <p className="text-gray-600">
                Swipe up on opportunities to save them for later
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {saved.map((item) => (
              <Card key={item.id} className="relative">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      Saved Opportunity #{item.opportunity_id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Saved on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove from saved"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
