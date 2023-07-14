import { assignPriority } from "@/components/utils/assignPriority";

const data = {
    correctCluster1: "SILVER",
    correctCluster2: "GOLD",
    correctMinistry1: "FLNR",
    correctMinistry2: "CITZ",
    lowerCaseCorrectCluster1: "SILVER",
    lowerCaseCorrectCluster2: "GOLD",
    lowerCaseCorrectMinistry1: "FLNR",
    lowerCaseCorrectMinistry2: "CITZ",
    realNonSuitableMinistry: "EAO",
    realNonSuitableCluster: "GOLDDR"
  };


test('Assign priorities unit tests', () => {
    expect(assignPriority(data.correctCluster1, data.correctMinistry1)).toBe('Yes');
    expect(assignPriority(data.correctCluster1, data.correctMinistry2)).toBe('Yes');
    expect(assignPriority(data.correctCluster2, data.correctMinistry1)).toBe('Yes');
    expect(assignPriority(data.correctCluster2, data.correctMinistry2)).toBe('Yes');
    expect(assignPriority(data.lowerCaseCorrectCluster1, data.correctMinistry1)).toBe('No');
    expect(assignPriority(data.correctCluster1, data.lowerCaseCorrectMinistry2)).toBe('No');
    expect(assignPriority(data.correctCluster1, data.realNonSuitableMinistry)).toBe('No');
    expect(assignPriority(data.realNonSuitableCluster, data.correctMinistry1)).toBe('No');
    expect(assignPriority('', data.correctMinistry1)).toBe('No');
    expect(assignPriority(data.correctCluster1, '')).toBe('No');
});

