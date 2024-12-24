#include <stdint.h>
int evaluate(int color, uint64_t whiteBoards[], uint64_t blackBoards[], uint64_t miscBoards[], int board[]);
extern uint64_t isolated_masks[64];
extern uint64_t wPassedPawn_masks[64];
extern uint64_t bPassedPawn_masks[64];
void initTables();