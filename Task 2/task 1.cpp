#include <iostream>
using namespace std;
int main()
{
         int graph[6][6] = {
        {0,4,2,0,0,0},
        {4,0,0,5,10,0},
        {2,0,0,8,3,0},
        {0,5,8,0,0,6},
        {0,10,3,0,0,2},
        {0,0,0,6,2,0},

    };

    cout << "Adjacency Matrix:" << endl;

    for(int i=0; i<6; i++) {
        for(int j=0; j<6; j++) {
            cout << graph[i][j] << " ";
        }
        cout << endl;
    }
  
     cout << "Areesha Zafar "<<endl;
    cout << "SP25-BSE-018 "<<endl;
    return 0;

}