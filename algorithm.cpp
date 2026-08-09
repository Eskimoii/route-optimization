#include <bits/stdc++.h>
using namespace std;

struct Result {
    double distance;
    vector<int> path;
};

class Graph{
 int V;
 vector<vector<pair<int,double>>> adj;

 void dijkstra(int src, vector<double>& dist, vector<int>& parent) {
        dist.assign(V, numeric_limits<double>::infinity());
        parent.resize(V);
        for (int i = 0; i < V; i++)
            parent[i] = i;
        priority_queue<pair<double,int>,vector<pair<double,int>>,greater<pair<double,int>>> pq;
        dist[src] = 0;
        pq.push({0, src});
        while (!pq.empty()) {
            auto t = pq.top();
            double d=t.first;
            int node=t.second;
            pq.pop();
            if (d > dist[node]) continue;
            for (auto a: adj[node]) {
                int adjNode=a.first;
                double wt=a.second;
                if (d + wt < dist[adjNode]) {
                    dist[adjNode] = d + wt;
                    parent[adjNode] = node;
                    pq.push({dist[adjNode], adjNode});
                }
            }
        }
        }

 public:
      Graph(int n){
         V=n;
         adj.resize(V);
      }

      void addEdge(int u,int v,double w){
        adj[u].push_back({v,w});
      }

     Result shortestPath(int src, int dest){
            vector<double> dist;
            vector<int> parent;
            dijkstra(src,dist,parent);
            Result r;
            if (dist[dest] == numeric_limits<double>::infinity()){
            return {-1, {}};
            }
            int node = dest;
            while (parent[node] != node) {
                r.path.push_back(node);
                node = parent[node];
            }
            r.path.push_back(src);
            reverse(r.path.begin(),r.path.end());
            r.distance=dist[dest];
            return r;
        }

};

int main(){
    ifstream file("road_network/graph.txt");
    if (!file) {
        cerr << "Could not open graph.txt\n";
        return 1;
    }
    int n,m;
    file >> n >> m;
    Graph g(n);
    for(int i=0;i<m;i++){
        int u,v;
        double w;
        file >> u >> v >> w;
        g.addEdge(u,v,w);
    }
    file.close();
    int src,dest;
    cin>>src>>dest;
    if (src < 0 || src >= n || dest < 0 || dest >= n) {
    cout << "Invalid source or destination\n";
    return 0;
    }
    Result r=g.shortestPath(src,dest);
    if(r.path.empty())
    cout<<"No path exists\n";
    else{
    cout<<"shortest distance: "<<r.distance<<"\n";
    cout<<"shortest path: ";
    for(int i=0;i<r.path.size();i++){
        cout<<r.path[i]<<" ";
    }
    cout<<"\n";
    }
}