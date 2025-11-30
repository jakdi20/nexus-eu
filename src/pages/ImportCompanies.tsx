import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ImportCompanies = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    setLoading(true);
    try {
      // Fetch the JSON file
      const response = await fetch('/companies_100.json');
      const companies = await response.json();
      
      console.log(`Loaded ${companies.length} companies from file`);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('import-companies', {
        body: { companies }
      });

      if (error) throw error;

      setResult(data);
      toast.success(`Successfully imported ${data.imported} companies!`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import companies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Import Mock Companies</h1>
        <p className="text-muted-foreground mb-6">
          This will import 100 mock companies into the database. All companies will be created without user associations.
        </p>
        
        <Button 
          onClick={handleImport} 
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            'Import Companies'
          )}
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h2 className="font-semibold mb-2">Import Results:</h2>
            <p>Total imported: {result.imported}</p>
            <p>Batches processed: {result.batches?.length}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImportCompanies;
