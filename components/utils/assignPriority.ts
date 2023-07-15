export function assignPriority(ministry: string, cluster: string) {
    if((ministry == 'FLNR' || ministry == 'CITZ') && (cluster == 'SILVER' || cluster == 'GOLD')){
        return 'Yes'
    }
    else {
        return 'No'
    }
        
  }

