// Astarion.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

/*
    position fen r1bqkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq - 0 5
    position startpos moves d2d4 e7e6 g1f3 b8c6 c1f4 d7d5 e2e3 f8b4 c2c3 b4e7 f1d3 h7h6
*/

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>
#include <stdint.h>
#include <bitset>
#include <unordered_map>
#include <chrono>
#include <ctime>
#include <thread>
#include <future>
#include <emscripten.h>

#include "AttackTables.h"
#include "MoveGen.h"
#include "Board.h"
#include "Perft.h"
#include "Globals.h"
#include "Position.h"
#include "Evaluation.h"
#include "Search.h"
#include "Zobrist.h"
#include "TranspositionTable.h"
#include "Tests.h"

//using namespace std;

//White = 1, Black = 0
int main(){
    return 0;
}
void sendCommand(std::chrono::milliseconds delay)
{
    std::this_thread::sleep_for(delay);
    stop = true;
}
std::chrono::time_point<std::chrono::system_clock> start, end;
int board2[64];
        



uint64_t blackBoards[7];
uint64_t whiteBoards[7];
uint64_t miscBoards[4];




int color = 1;
extern "C"{
    EMSCRIPTEN_KEEPALIVE
    const char* initEngine(){
        pieceMaps(); 
        initZobrist(); //zobrist table
        generateTables(); //attack tables
        initTables(); //pestos psq tables
        clearHashmap(); //tt table
        clearHistory(); //history table
        clearKillers(); //killer moves table
        initHashmap(256);
        initTests();
        return "Initialized engine";
        
    }
    EMSCRIPTEN_KEEPALIVE
    const char* test2(){
        start = std::chrono::system_clock::now();
        end = std::chrono::system_clock::now();
        std::chrono::duration<double> elapsed_seconds = end - start;
        std::string res = "Time: " + std::to_string(elapsed_seconds.count()) + "s";
        return res.c_str();
    }
    EMSCRIPTEN_KEEPALIVE
    const char* perft(){   
        bool passed = true;
        std::string returnRes;
        for (int i = 0; i < tests.size(); i++) {
            start = std::chrono::system_clock::now();
            resetBoard(board2, whiteBoards, blackBoards, miscBoards);
            updateFromFen(board2, tests[i].fen, miscBoards, color);
            updateBitBoards2(board2, blackBoards, whiteBoards, miscBoards);
            uint64_t curr = perft(color, whiteBoards, blackBoards, miscBoards, tests[i].depth, board2);
            std::string res = "\n" + tests[i].fen + " Expected nodes: " + std::to_string(tests[i].result) + " Traversed nodes: " + std::to_string(curr) + " Depth: " + std::to_string(tests[i].depth);
            if (curr == tests[i].result)
            {
                res += " TEST PASSED\n";
            }
            else
            {
                res += " TEST FAILED\n";
                passed = false;
            }
            //std::cout << res;
            returnRes += res;
        }
        if (passed) {
            //std::cout << "\nALL TESTS PASSED\n";
            returnRes += "\nALL TESTS PASSED\n";
        }
        else {
            //std::cout << "\nTESTING FAILED\n";
            returnRes += "\nTESTING FAILED\n";
        }
        end = std::chrono::system_clock::now();
        std::chrono::duration<double> elapsed_seconds = end - start;
        returnRes += "\nElapsed time: " + std::to_string(elapsed_seconds.count()) + "s\n";
        //std::cout << "\nElapsed time: " << elapsed_seconds.count() << "s\n";
        return returnRes.c_str();
    }
    

    EMSCRIPTEN_KEEPALIVE
    const char* engineMove(const char* fen, int t){
        std::string res;
        //repetition.clear();
        std::string wholeFen(fen); 
        updateFromFen(board2, wholeFen, miscBoards, color);
        computeZobrist(board2, color, miscBoards);
        updateBitBoards2(board2, blackBoards, whiteBoards, miscBoards);
        int time = 0;
        stop = false;
        bool setDepth = true;
        nodes = 0;
        qNodes = 0;
        int material = getMaterialCount(whiteBoards, blackBoards);
        time = t / estimatedHalfMoves(material);
        time *= 2;
        //time = 1000; setDepth = false; //just for testing purposes
        if (!setDepth) {
            //auto s1 = std::async(std::launch::async, sendCommand, std::chrono::milliseconds(time));
            std::string js_code = "setTimeout(function() { Module._stopSearch(); }, " + std::to_string(time) + ");";
            emscripten_run_script(js_code.c_str());
            res = negamaxHelper2(color, whiteBoards, blackBoards, miscBoards, board2, setDepth);
        }
        else {
            res = negamaxHelper2(color, whiteBoards, blackBoards, miscBoards, board2, setDepth);
        }
        
        
        clearHashmap();
        clearKillers();
        clearHistory();
        resetBoard(board2, whiteBoards, blackBoards, miscBoards);
        nodes = 0;
        repetition.clear();
        return res.c_str();
    }
    EMSCRIPTEN_KEEPALIVE
    void stopSearch(){
        stop = true;
    }
}


extern "C"{
    EMSCRIPTEN_KEEPALIVE
    void uci(std::string input)
    {
        
        
        //std::string input;
        //printBitBoard(rookAttacks[28][3]);
        while (std::getline(std::cin, input)) { //uci loop
            std::stringstream inputSS(input);
            std::string token;
            std::vector<std::string> tokens;
            while (getline(inputSS, token, ' ')) {
                tokens.push_back(token);
            }
            if (tokens[0] == "go") {
                int time = 0;
                stop = false;
                bool setDepth = false;
                nodes = 0;
                qNodes = 0;
                if (tokens.size() > 1)
                {
                    if (color == 0)
                    {
                        time = std::stoi(tokens[4]);
                    }
                    else
                    {
                        time = std::stoi(tokens[2]);
                    }
                    int material = getMaterialCount(whiteBoards, blackBoards);
                    //Console.WriteLine(time);
                    time = time / estimatedHalfMoves(material);
                    time *= 2;
                    //time;
                }
                else { //if time not specified
                    setDepth = true;
                }
                //time = 1000; setDepth = false; //just for testing purposes
                if (!setDepth) {
                    auto s1 = std::async(std::launch::async, sendCommand, std::chrono::milliseconds(time));
                    negamaxHelper(color, whiteBoards, blackBoards, miscBoards, board2, setDepth);
                }
                else {
                    negamaxHelper(color, whiteBoards, blackBoards, miscBoards, board2, setDepth);
                }
                
                
                clearHashmap();
                clearKillers();
                clearHistory();
                nodes = 0;
                repetition.clear();
            }
            else if (tokens[0] == "uci") {
                std::cout << "id name " << "Astarion_V1" << std::endl;
                std::cout << "id author " << "Cameron Mah" << std::endl;
                std::cout << "uciok" << std::endl;
            }
            else if (tokens[0] == "isready") {
                std::cout << "readyok" << std::endl;
            }
            else if (tokens[0] == "position") {
                repetition.clear();
                resetBoard(board2, whiteBoards, blackBoards, miscBoards);
                if (tokens[1] == "fen") {
                    std::string wholeFen = tokens[2] + " " + tokens[3] + " " + tokens[4];
                    updateFromFen(board2, wholeFen, miscBoards, color);
                    computeZobrist(board2, color, miscBoards);
                    auto it = find(tokens.begin(), tokens.end(), "moves");
                    if (it != tokens.end()) {
                        int index = it - tokens.begin();
                        std::vector<std::string> moves(tokens.begin() + index, tokens.end());
                        updateBoard(board2, moves, miscBoards, color);
                        if ((tokens.size()-index) % 2 == 0) {
                            color ^= 1;
                        }
                    }
                }
                else if (tokens[1] == "startpos") {
                    miscBoards[3] = 0b10010001'00000000'00000000'00000000'00000000'00000000'00000000'10010001;
                    updateFromFen(board2, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq", miscBoards, color);
                    if (tokens.size() == 2) { //starting position
                        color = 1;
                    }
                    else {
                        //remember to account for repetition, castlerights
                        std::vector<std::string> moves(tokens.begin() + 3, tokens.end());
                        updateBoard(board2, moves, miscBoards, 1);
                        if (tokens.size() % 2 == 0) {
                            color = 0;
                        }
                        else {
                            color = 1;
                        }
                    }
                    computeZobrist(board2, color, miscBoards);
                }
                updateBitBoards2(board2, blackBoards, whiteBoards, miscBoards);
                /*
                for (int i = 0; i < 64; i++) {
                    board2[i] = pieceToVal[board[i]];
                }*/
                //std::cout << killers[0][0];
            }
            else if (tokens[0] == "p") {
                printBoard2(board2);
            }
            else if (tokens[0] == "cell") {
                std::cout << getCellNumber(tokens[1]) << std::endl;
            }
            else if (tokens[0] == "boards") {
                std::cout << "\tWhite Boards" << std::endl << std::endl;
                for (int i = 0; i < 7; i++) {
                    printBitBoard(whiteBoards[i]);
                }
                std::cout << "\tBlack Boards" << std::endl << std::endl;
                for (int i = 0; i < 7; i++) {
                    printBitBoard(blackBoards[i]);
                }
                std::cout << "\tMisc Boards" << std::endl << std::endl;
                for (int i = 0; i < 4; i++) {
                    printBitBoard(miscBoards[i]);
                }
            }
            else if (tokens[0] == "attacks") {
                for (int i = 0; i < 64; i++) {
                    std::cout << "Source: " << i << std::endl;
                    printBitBoard(enPassantAttacks[i]);
                }
                /*
                for (int i = 0; i < 64; i++) {
                    for (int j = 0; j < 4; j++) {
                        cout << "Source: " << i << endl;
                        printBitBoard(rookAttacks[i][j]);
                    }
                }*/
            }
            else if (tokens[0] == "mvs") {
                int idx = 0;
                int moves[256];
                getPawnMoves(moves, idx, color, whiteBoards, blackBoards, miscBoards);
                getKnightMoves(moves, idx, color, whiteBoards, blackBoards, miscBoards);
                getBishopAndQueenMoves(moves, idx, color, whiteBoards, blackBoards, miscBoards);
                getRookAndQueenMoves(moves, idx, color, whiteBoards, blackBoards, miscBoards);
                getKingMoves(moves, idx, color, whiteBoards, blackBoards, miscBoards);
                for (int i = 0; i < idx; i++) {
                    std::cout << notation[getMoveSource(moves[i])] << notation[getMoveTarget(moves[i])] << " Promotion: " << getMoveIsPromotion(moves[i]) << getMoveIsCapture(moves[i]) << " | " << getMoveIsCastling(moves[i]) << " | " << getMoveIsDoublePush(moves[i]) << " | " << getMoveIsEnPassant(moves[i]) << " | " << std::endl;
                    //cout << bitset<26>(moves[i]) << endl << bitset<26>(getMoveIsPromotion(moves[i])) << endl << endl;
                }
                std::cout << idx;
            }
            else if (tokens[0] == "atk") {
                int idx = 0;
                int moves[256];
                getCaptures(moves, idx, color, whiteBoards, blackBoards, miscBoards);
                for (int i = 0; i < idx; i++) {
                    std::cout << "Source square: " << getMoveSource(moves[i]) << " End Square: " << getMoveTarget(moves[i]) << " Promotion: " << std::endl;
                }
                std::cout << "Total Attacks: " << idx << std::endl;
            }
            else if (tokens[0] == "atkTables") {
                for (int i = 0; i < 4; i++) {
                    for (int j = 0; j < 64; j++) {
                        printBitBoard(bishopAttacks[j][i]);
                    }
                    std::cout << "---------------------------------------------" << std::endl;
                }
                for (int i = 0; i < 64; i++) {
                    printBitBoard(pawnAttacksB[i]);
                }
            }
            else if (tokens[0] == "runPerft") {
                bool passed = true;
                for (int i = 0; i < tests.size(); i++) {
                    start = std::chrono::system_clock::now();
                    resetBoard(board2, whiteBoards, blackBoards, miscBoards);
                    updateFromFen(board2, tests[i].fen, miscBoards, color);
                    updateBitBoards2(board2, blackBoards, whiteBoards, miscBoards);
                    uint64_t curr = perft(color, whiteBoards, blackBoards, miscBoards, tests[i].depth, board2);
                    std::string res = "\n" + tests[i].fen + " Expected nodes: " + std::to_string(tests[i].result) + " Traversed nodes: " + std::to_string(curr) + " Depth: " + std::to_string(tests[i].depth);
                    if (curr == tests[i].result)
                    {
                        res += " TEST PASSED\n";
                    }
                    else
                    {
                        res += " TEST FAILED\n";
                        passed = false;
                    }
                    std::cout << res;
                }
                if (passed) {
                    std::cout << "\nALL TESTS PASSED\n";
                }
                else {
                    std::cout << "\nTESTING FAILED\n";
                }
                end = std::chrono::system_clock::now();
                std::chrono::duration<double> elapsed_seconds = end - start;
                std::cout << "\nElapsed time: " << elapsed_seconds.count() << "s\n";
            }
            else if (tokens[0] == "perft") { 
                start = std::chrono::system_clock::now();
                std::cout << std::endl << "Nodes: " << perftHelper(color, whiteBoards, blackBoards, miscBoards, stoi(tokens[1]), board2);
                end = std::chrono::system_clock::now();
                std::chrono::duration<double> elapsed_seconds = end - start;
                std::cout << "\nElapsed time: " << elapsed_seconds.count() << "s\n";
            }
            else if (tokens[0] == "eval") {
                std::cout << evaluate(color, whiteBoards, blackBoards, miscBoards, board2);
            }
            else if (tokens[0] == "hash") {
                std::cout << "Hash: " << zobristKey << std::endl;
            }
            else if (tokens[0] == "see") {
                int src = stoi(tokens[1]);
                int piece = board2[src];
                int dest = stoi(tokens[2]);
                //std::cout << "SEE: " << SEE(stoi(tokens[1]), whiteBoards, blackBoards, miscBoards, board2, parseMove(60, 28, R, 0, 1, 0, 0, 0), color); //position 1 in cpw SEE https://www.chessprogramming.org/SEE_-_The_Swap_Algorithm
                //std::cout << "SEE: " << SEE(stoi(tokens[1]), whiteBoards, blackBoards, miscBoards, board2, parseMove(43, 28, N, 0, 1, 0, 0, 0), color); //position 2 
                std::cout << "SEE: " << SEE(dest, whiteBoards, blackBoards, miscBoards, board2, parseMove(src, dest, piece, 0, 1, 0, 0, 0), color, 0);
            }
            else if (tokens[0] == "test") {
                int totalNodes = 0, totalQNodes = 0;
                for (int i = 0; i < testsSearch.size(); i++) {
                    resetBoard(board2, whiteBoards, blackBoards, miscBoards);
                    std::string wholeFen = testsSearch[i].fen;
                    updateFromFen(board2, wholeFen, miscBoards, color);
                    computeZobrist(board2, color, miscBoards);
                    updateBitBoards2(board2, blackBoards, whiteBoards, miscBoards);
                    negamaxHelper(color, whiteBoards, blackBoards, miscBoards, board2, true);
                    //std::cout << "\n" << testsSearch[i].fen << "Nodes: " << nodes << std::endl;
                    totalNodes += nodes;
                    totalQNodes += qNodes;
                    nodes = 0; qNodes = 0;
                }
                std::cout << "\n\n" << "Total Nodes: " << totalNodes << " Total qNodes: " << totalQNodes;
                
            }
            else {
                std::cout << "Unknown Command" << std::endl;
            }
        }
    }
}


