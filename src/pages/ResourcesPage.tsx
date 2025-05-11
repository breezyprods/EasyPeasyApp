
import Layout from '../components/Layout';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { BookOpen } from 'lucide-react';

const ResourcesPage = () => {
  const resources = [
    {
      id: 1,
      title: "EasyPeasy Method (Full Book)",
      description: "The complete EasyPeasy book in PDF format.",
      link: "https://easypeasymethod.org/easypeasy.pdf"
    },
    {
      id: 2,
      title: "r/pornfree",
      description: "A supportive community focused on living porn-free without shame or guilt.",
      link: "https://www.reddit.com/r/pornfree/"
    },
    {
      id: 3,
      title: "Your Brain on Porn",
      description: "Scientific information about the effects of pornography on the brain and behavior.",
      link: "https://www.yourbrainonporn.com/"
    },
    {
      id: 4,
      title: "Recovery Nation",
      description: "A comprehensive resource for recovery with worksheets and educational material.",
      link: "http://www.recoverynation.com/"
    },
    {
      id: 5,
      title: "RebootNation",
      description: "A forum focused on recovery and reversing the effects of pornography use.",
      link: "https://www.rebootnation.org/"
    }
  ];
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-medium mb-2">Helpful Resources</h1>
        <p className="text-muted-foreground mb-8">
          Text-only links to supportive resources with no external images or embeds.
        </p>
        
        <div className="space-y-4">
          {resources.map(resource => (
            <Card key={resource.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-muted-foreground">{resource.description}</p>
                <a 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Resource →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ResourcesPage;
