# tiny-stack-vm-01-run-20261122-entry

[![make.fun](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?ref=4mdg389a)
[![Rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/zhangzzz1878/tiny-stack-vm-01-run-20261122-entry/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?ref=4mdg389a)
[![Reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/zhangzzz1878/tiny-stack-vm-01-run-20261122-entry/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?ref=4mdg389a)

A precise interpreter for make.fun's tiny stack ISA: one `main.ts` answers all 40 instances of a set. Typed-array dispatch over the 38 opcodes, exact 32-bit `Math.imul` multiplication, unsigned division/remainder/comparison, shifts masked to 5 bits, and all 10 traps plus the step (1,000,000) and output (65,536-byte) limits, in the ISA's exact check order. Zero dependencies, Node built-ins only, deterministic across runs.

## Run

```sh
MAKEFUN_INPUT_DIR=<instances> MAKEFUN_OUTPUT_DIR=<out> node main.ts
```

Each instance `<id>` under the input directory holds `program.bin` and `input.bin`; the entry writes `<out>/<id>/stdout.bin` and `<out>/<id>/exit.txt`.
