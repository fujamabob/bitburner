
// export namespace BitAgents {

//     /**
//      * Data corresponding to a system event.
//      *
//      * @property type The name of the event type
//      *
//      */
//     export interface Event {
//         readonly type: string;
//         /** Format ourselves for humans */
//         describe(): string;
//         /** Format ourselves for machines */
//         serialize(): string;
//     }

//     /**
//      * Agents carry out various strategies on a system.
//      *
//      * Ideally, they should be disposable, i.e., random restarts should not
//      * affect their functionality except perhaps for inefficiencies due to
//      * churning.
//      *
//      * Example: A SharingAgent might ensure ns.share is running
//      * on a system, within a given ram budget.
//      */
//     export interface Agent {
//         // Agents have two sources of input, minimally:
//         //  - The system they're monitoring
//         //  - The control side

//         /** Check the system for events. */
//         sense(): Array<Event>;
//         /** Respond to an event.
//          * @param event An event that needs a response
//          * @returns True if the event was handled, false otherwise
//         */
//         effect(event: Event): boolean;
//         /** Special response; ask a human for help.  Must always succeed.
//          * @param event An event that needs a response
//          */
//         help(event: Event): void;
//         /** Run a control loop.
//          * @returns True if the Agent is running, false otherwise
//         */
//         run(): boolean
//     }

//     export class TestEvent implements Event {
//         readonly type: string = "TestEvent";

//         describe(): string {
//             return `Event of type ${this.type}`
//         }

//         serialize(): string {
//             return JSON.stringify({ type: this.type })
//         }
//     }

//     export class HelpAgent implements Agent {
//         sense(): Array<Event> {
//             // We see nothing.
//             return new Array<Event>()
//         }
//         effect(event: Event): boolean {
//             this.help(event)
//             return true
//         }
//         help(event: Event): void {
//             ns.alert(`Please help; we received ${event.describe()}`)
//         }
//         run(): boolean {
//             // We merely wait for outside events
//             return true
//         }
//     }
// }
