emcc engine/AttackTables.cpp \
      engine/Board.cpp \
      engine/Evaluation.cpp \
      engine/Globals.cpp \
      engine/MoveGen.cpp \
      engine/Perft.cpp \
      engine/Position.cpp \
      engine/Search.cpp \
      engine/Tests.cpp \
      engine/TranspositionTable.cpp \
      engine/Zobrist.cpp \
      engine/Astarion.cpp \
      -o src/a.out.js \
      -s NO_EXIT_RUNTIME=1 \
      -s EXPORTED_RUNTIME_METHODS='[ccall,UTF8ToString]' \
      -s INITIAL_MEMORY=536870912 \
      -s MAXIMUM_MEMORY=2147483648 \
      -s ALLOW_MEMORY_GROWTH=1 \
      -s EXPORTED_FUNCTIONS='["_test2","_initEngine","_perft","_engineMove", "_stopSearch"]' \
      -s EXPORT_ES6=1 \
      -s WASM=1 \
      -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
      -s ENVIRONMENT="web" \