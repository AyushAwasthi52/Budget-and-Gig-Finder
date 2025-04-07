import { Users } from "lucide-react"; // Make sure to import Users icon
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JobPosting {
  id: string;
  title: string;
  applicants: number;
  status?: 'active' | 'paused' | 'closed';
  postedDate?: string;
}

interface JobPostingsListProps {
  postings: JobPosting[];
}

export function JobPostingsList({ postings }: JobPostingsListProps) {
  return (
    <div className="space-y-4">
      {postings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No job postings found</p>
          <Button variant="outline" className="mt-4">
            Create Your First Job Posting
          </Button>
        </div>
      ) : (
        postings.map((posting) => (
          <Card key={posting.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{posting.title}</CardTitle>
                  <CardDescription>
                    Posted {posting.postedDate || 'recently'}
                  </CardDescription>
                </div>
                <Badge variant={posting.status === 'active' ? 'default' : 'secondary'}>
                  {posting.status || 'active'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {posting.applicants} applicant{posting.applicants !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <div className="space-x-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button size="sm">
                  Manage Applicants
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}