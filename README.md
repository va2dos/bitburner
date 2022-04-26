# bitburner

Ingame Script to Automate gameplay on Bitburner : https://danielyxie.github.io/bitburner/

## pre "Formula.exe
### best-target.js
Find the best target to get max money income
### deploy.js
Script that deploy on all "hacked" targets knowed on the network 
### auto-target.js
Script that will monitor player's progress, hack new target when skills level is reach
and deploy the "bhack.js" on it and start it.
Can also be used to mass update the current target of the bhack.js script.
### auto-prchase-program.js
After buying the TOR router, we will try to auto-buy programs when availble
### auto-root.js
Script that will auto root/backdoor new available target (that match our current skipps/cracks)
## discovery.js
Script that output all reachable targets with their basic stats
## bhack.js
Script that can be run on target to generate income (user deploy to copy)

## with "Formula.exe
### analyse.js
This script will calculate the number or thread needed for a target full Cycle
Grow (More money) > Weaken (Less security) > Hack (Steal money) > Weaken (Less security)
all calculated to run the 4 operation in paralle so they end (take effect) at 100ms intervals
### auto-zombi.js
Re using the same algoryth has "analyse.js" it will try to spawn those 4 process for each available hackable target
on all server Rooted in the network. (Including purchased server)
### auto-purchase-server.js
Script that will auto purchase new server in the farm
### auto-hacknet.js
Will purchase the hacknet's node base on money availibility and ROI (Purchase price mush be gained back in X hours)

# TODO

* Investigate Stock Market


# INSPIRATION

Game sources :
https://github.com/danielyxie/bitburner/blob/dev/markdown/bitburner.ns.md

Other moders :
https://github.com/chrisrabe/bitburner-automation
https://github.com/alainbryden/bitburner-scripts
