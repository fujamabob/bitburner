Script cleanup:
---------------
 - Scripts like "lock" should be of the form "lock" "lock -u" "lock -info" or similar
 - Automatable things should work in stages
  - Do the thing
  - Recommend me a thing
  - Handle it for me
 - Now that we can use args / flags, use them
 - Standardized boilerplate for setting ns / logging?
 - Is the logging stuff ram expensive?

NetworkPipe -> NamedPipe / pipe address space
NetworkPipe -> Mutex / Wall / etc?
NetworkPipe -> 0 RAM proxy methods for ns namespace stuff?

Config file layer
 --> Executor based on config file
 --> Partition off RAM hungry stuff into cache-able config files
 --> Update config and SIGHUP

Remember: the manager needs to run in 8GB, scalabl