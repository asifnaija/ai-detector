export type DiffPart = {
  type: 'same' | 'added' | 'removed';
  value: string;
};

// A simplified word-level diff implementation
// Uses a basic LCS (Longest Common Subsequence) approach for words
export const computeWordDiff = (text1: string, text2: string): DiffPart[] => {
  // Normalize whitespace but keep newlines as distinct tokens if possible, 
  // or just split by whitespace for simplicity.
  const words1 = text1.split(/(\s+)/);
  const words2 = text2.split(/(\s+)/);

  const m = words1.length;
  const n = words2.length;
  
  // Matrix for LCS
  const C = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        C[i][j] = C[i - 1][j - 1] + 1;
      } else {
        C[i][j] = Math.max(C[i][j - 1], C[i - 1][j]);
      }
    }
  }

  // Backtrack to find diff
  const diff: DiffPart[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && words1[i - 1] === words2[j - 1]) {
      diff.unshift({ type: 'same', value: words1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || C[i][j - 1] >= C[i - 1][j])) {
      diff.unshift({ type: 'added', value: words2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || C[i][j - 1] < C[i - 1][j])) {
      diff.unshift({ type: 'removed', value: words1[i - 1] });
      i--;
    }
  }

  return diff;
};