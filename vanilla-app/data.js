export const appData = {
    curriculum: [
        {
            id: "level1",
            title: "LEVEL 1: Concepts & Lifecycle",
            checkpoints: [
                {
                    id: "cp1",
                    title: "Lesson 1: State",
                    lessons: [
                        {
                            title: "",
                            theory_text: "",
                            interaction: {
                                type: "lightbulb_hook"
                            },
                            feedback_success: "",
                            detailed_explanation: "",
                            feedback_fail: ""
                        },
                        {
                            title: "What just changed?",
                            theory_text: "",
                            interaction: {
                                type: "single_choice",
                                options: [
                                    { id: "opt1", text: "State" },
                                    { id: "opt2", text: "Event" }
                                ],
                                correct_id: "opt1"
                            },
                            feedback_success: "Great!",
                            detailed_explanation: "State is a way to describe the current condition of a system or object at a specific moment. In this example, the lightbulb can only be in 1 of 2 conditions: OFF or ON. Identifying the correct State helps us know what the system is doing and what it can do next.",
                            feedback_fail: "Not quite. Please try again!"
                        },
                        {
                            title: "State & Event",
                            theory_text: "Drag the 'Wake Up' action card to the Robot to change its state.",
                            interaction: {
                                type: "drag_to_robot",
                                draggable_tokens: [
                                    { id: "t1", text: "Wake Up" }
                                ]
                            },
                            feedback_success: "Great!",
                            detailed_explanation: "In a Statechart, an Event is the 'trigger' that causes a change. The Robot is in the 'Sleeping' State, but when the 'Wake Up' Event occurs, it is forced to react and transition to a new State called 'Awake'. Software systems always operate based on this Event response mechanism.",
                            feedback_fail: "Not quite. Drag the Wake Up card to the Robot."
                        },
                        {
                            title: "Categorizing States",
                            theory_text: "Drop the labels that are States into the box.",
                            interaction: {
                                type: "categorize_states",
                                box_label: "STATE",
                                draggable_tokens: [
                                    { id: "s1", text: "OFF", isState: true },
                                    { id: "a1", text: "Press", isState: false },
                                    { id: "s2", text: "ON", isState: true },
                                    { id: "a2", text: "Wake Up", isState: false },
                                    { id: "s3", text: "Sleeping", isState: true },
                                    { id: "s4", text: "Awake", isState: true }
                                ]
                            },
                            feedback_success: "Excellent!",
                            detailed_explanation: "A quick tip: States are usually adjectives or nouns describing a static condition (like OFF, ON, Sleeping, Awake). Meanwhile, Events are usually verbs indicating immediate actions (like Press, Wake Up). An Event is the cause, and a State is the result of the system after receiving that Event.",
                            feedback_fail: "Not quite. Only select the words that indicate a current condition."
                        }
                    ]
                },
                {
                    id: "cp2",
                    title: "Lesson 2: Transition",
                    lessons: [
                        {
                            title: "",
                            theory_text: "How does the system know the lightbulb can change from OFF to ON?",
                            interaction: {
                                type: "transition_hook"
                            },
                            feedback_success: "",
                            detailed_explanation: "A Transition is a bridge between States. It is represented by a directed arrow, indicating which State the system is allowed to move from and to. Without Transitions, the system would be 'stuck' forever in a single State.",
                            feedback_fail: ""
                        },
                        {
                            title: "Drawing a Transition",
                            theory_text: "Draw your first Transition by connecting [Locked] to [Unlocked].",
                            interaction: {
                                type: "connect_nodes",
                                nodes: [
                                    { id: "node1", text: "Locked", isStart: true },
                                    { id: "node2", text: "Unlocked", isEnd: true }
                                ]
                            },
                            feedback_success: "Great job!",
                            detailed_explanation: "Very good! You just created a Transition. In a Statechart, a Transition arrow is unidirectional (from Source State to Target State). This establishes a strict rule: The system can only go from [Locked] to [Unlocked], and cannot suddenly skip or go backwards without a reverse arrow.",
                            feedback_fail: "Not quite. Try drawing the arrow connecting the 2 states logically!"
                        },
                        {
                            title: "Choose the correct Transition",
                            theory_text: "A fan has OFF, Level 1, Level 2. Choose the correct chart.",
                            interaction: {
                                type: "multiple_choice_image",
                                options: [
                                    { id: "optA", text: "[OFF] ➔ [Level 1] ➔ [Level 2]" },
                                    { id: "optB", text: "[OFF] ➔ [Level 2]" },
                                    { id: "optC", text: "[OFF] ⟷ [Level 1]" }
                                ],
                                correct_id: "optA"
                            },
                            feedback_success: "Correct!",
                            detailed_explanation: "Exactly! A Statechart doesn't just list states, it also dictates the valid 'workflow'. The fan cannot skip from [OFF] straight to [Level 2] without passing through [Level 1]. Drawing sequential Transitions helps programmers control the logical sequence of the system, avoiding unwanted state bugs.",
                            feedback_fail: "Not quite."
                        },
                        {
                            title: "Completing the process",
                            theory_text: "The hand dryer process is missing 1 step to be able to dry again. Draw the missing arrow.",
                            interaction: {
                                type: "repair_transition",
                                nodes: [
                                    { id: "node_idle", text: "Idle" },
                                    { id: "node_say", text: "Drying" }
                                ],
                                existing_arrows: [
                                    { from: "node_idle", to: "node_say" }
                                ],
                                required_arrow: { from: "node_say", to: "node_idle" }
                            },
                            feedback_success: "Great!",
                            detailed_explanation: "Awesome! Without this return arrow, the hand dryer would fall into a 'dead-end' - it would dry forever and never stop. When designing a Statechart, ensuring a closed loop or an exit path for every State is a crucial principle so the system doesn't freeze.",
                            feedback_fail: "Not quite. Find a way to make it return to Idle."
                        }
                    ]
                },
                {
                    id: "cp3",
                    title: "Lesson 3: Event",
                    lessons: [
                        {
                            title: "",
                            theory_text: "What triggers the arrow?",
                            interaction: { type: "event_hook" },
                            feedback_success: "",
                            detailed_explanation: "An Event is the trigger that causes a change. A state does not naturally transition without an external impact.",
                            feedback_fail: ""
                        },
                        {
                            title: "Attaching an Event to a Transition",
                            theory_text: "An automatic door sensor detects a customer. Attach the appropriate Event to tell the system to open the door when someone is present.",
                            interaction: { type: "attach_event", box_label: "DETECT_PERSON", state_a: "Closed", state_b: "Open", decoys: ["TIMEOUT", "DOOR_OPEN"] },
                            feedback_success: "Great!",
                            detailed_explanation: "An Event is placed on a Transition to define 'when' this shift occurs.",
                            feedback_fail: "Not quite. Drag the label onto the connecting line."
                        },
                        {
                            title: "Simulation",
                            theory_text: "ATM Simulation: Trigger the correct Event to transition the state.",
                            interaction: { type: "simulate_atm" },
                            feedback_success: "Great!",
                            detailed_explanation: "If an Event occurs but the current State has no Transition reacting to it, that Event is ignored.",
                            feedback_fail: "Not quite. Click the button corresponding to the current state."
                        },
                        {
                            title: "Fix the bug",
                            theory_text: "The music player diagram is missing an Event, attach the correct one.",
                            interaction: { type: "attach_event_repair", box_label: "PAUSE", state_a: "Playing", state_b: "Paused", decoys: ["PLAY", "STOP"] },
                            feedback_success: "Great!",
                            detailed_explanation: "A Statechart forces you to clearly define what each triggering Event is.",
                            feedback_fail: "Not quite. If it's Playing, it must be Paused to make sense."
                        }
                    ]
                },
                {
                    id: "cp4",
                    title: "Lesson 4: Initial State",
                    lessons: [
                        {
                            title: "",
                            theory_text: "How does the system know where to start?",
                            interaction: { type: "initial_hook" },
                            feedback_success: "",
                            detailed_explanation: "The system gets confused when powered on because no Initial State is specified.",
                            feedback_fail: ""
                        },
                        {
                            title: "Attaching an Initial Node",
                            theory_text: "Drag the black dot to connect it to OFF.",
                            interaction: { type: "attach_initial" },
                            feedback_success: "Great!",
                            detailed_explanation: "The small black dot is called an Initial Node. The arrow from it points directly to the very first State.",
                            feedback_fail: "Not quite. Connect the black dot to OFF."
                        },
                        {
                            title: "Finding the starting point",
                            theory_text: "Which State will the user start at?",
                            interaction: { 
                                type: "multiple_choice_image",
                                options: [
                                    { id: "opt1", text: "[Cart]" },
                                    { id: "opt2", text: "[Checkout]" }
                                ],
                                correct_id: "opt1"
                            },
                            feedback_success: "Great!",
                            detailed_explanation: "Always look for the first black dot.",
                            feedback_fail: "Not quite."
                        },
                        {
                            title: "Removing redundant Initial Node",
                            theory_text: "Delete the incorrect Initial arrow.",
                            interaction: { type: "repair_delete", target: "initial" },
                            feedback_success: "Great!",
                            detailed_explanation: "There can never be more than 1 starting point at the same level.",
                            feedback_fail: "Not quite."
                        }
                    ]
                },
                {
                    id: "cp5",
                    title: "Lesson 5: Final State",
                    lessons: [
                        {
                            title: "",
                            theory_text: "This process needs to end.",
                            interaction: { type: "final_hook" },
                            feedback_success: "",
                            detailed_explanation: "Some processes require a definitive end point.",
                            feedback_fail: ""
                        },
                        {
                            title: "Attaching a Final State",
                            theory_text: "Drag to connect to the Final State.",
                            interaction: { type: "attach_final" },
                            feedback_success: "Great!",
                            detailed_explanation: "The Final State represents completion.",
                            feedback_fail: "Not quite."
                        },
                        {
                            title: "Finding the end point",
                            theory_text: "This ATM is designed to automatically power off (Final State) after completing its process. Looking at the diagram, after leaving which state will the machine turn off?",
                            interaction: { 
                                type: "multiple_choice_image",
                                options: [
                                    { id: "opt1", text: "[Print Receipt]" },
                                    { id: "opt2", text: "[Wait]" }
                                ],
                                correct_id: "opt1"
                            },
                            feedback_success: "Correct!",
                            detailed_explanation: "The black dot with a circular border (Final Node) always represents the system's final stopping point. The arrow from [Print Receipt] pointing straight to the Final Node shows the machine will power off (complete the process) after printing is done.",
                            feedback_fail: "Incorrect. Look closely at which State the arrow pointing into the Final Node (the bordered black circle) originates from."
                        },
                        {
                            title: "Fixing Final State bug",
                            theory_text: "Delete the arrow going out of the Final State.",
                            interaction: { type: "repair_delete", target: "final" },
                            feedback_success: "Great!",
                            detailed_explanation: "There are no outgoing arrows from a Final State.",
                            feedback_fail: "Not quite."
                        }
                    ]
                },
                {
                    id: "cp6",
                    title: "Lesson 6: Guard",
                    lessons: [
                        {
                            title: "",
                            theory_text: "A protective layer is needed for the Transition.",
                            interaction: { type: "guard_hook" },
                            feedback_success: "",
                            detailed_explanation: "Guarding Transitions that are not allowed to occur.",
                            feedback_fail: ""
                        },
                        {
                            title: "Attaching a Guard",
                            theory_text: "Attach the appropriate Guard to allow dispensing cash when the account has a balance.",
                            interaction: { type: "attach_guard", box_label: "[balance > 0]", state_a: "Waiting for Withdrawal", state_b: "Dispense Cash", decoys: ["[balance < 0]", "TIMEOUT"] },
                            feedback_success: "Great!",
                            detailed_explanation: "A Guard determines whether a Transition is allowed to run, even if the Event occurs.",
                            feedback_fail: "Not quite."
                        }
                    ]
                },
                {
                    id: "cp7",
                    title: "Lesson 7: Action",
                    lessons: [
                        {
                            title: "",
                            theory_text: "The event needs a practical action.",
                            interaction: { type: "action_hook" },
                            feedback_success: "",
                            detailed_explanation: "A Transition can also be accompanied by a piece of executable code.",
                            feedback_fail: ""
                        },
                        {
                            title: "Attaching an Action",
                            theory_text: "Attach the appropriate Action to execute data saving.",
                            interaction: { type: "attach_action", box_label: "/send_to_server()", state_a: "Unsaved", state_b: "Saved", decoys: ["/play_sound()", "[is_online]"] },
                            feedback_success: "Great!",
                            detailed_explanation: "An Action runs when the system transitions.",
                            feedback_fail: "Not quite."
                        }
                    ]
                },
                {
                    id: "cp8",
                    title: "Lesson 8: Composite State",
                    lessons: [
                        {
                            title: "Arrow Chaos",
                            theory_text: "This diagram is an eyesore! Is there a way to clean it up?",
                            interaction: { type: "composite_hook" },
                            feedback_success: "",
                            detailed_explanation: "Instead of drawing 4 identical arrows, we group them into an area called a Composite State. An arrow coming out of the outer border will apply to all States inside!",
                            feedback_fail: ""
                        },
                        {
                            title: "Group it yourself",
                            theory_text: "Put the states that belong to when the music player is operating into the [ON] frame.",
                            interaction: { type: "composite_drag" },
                            feedback_success: "Neat and tidy!",
                            detailed_explanation: "By grouping [Playing] and [Paused] into [ON], we can manage them together, separate from [OFF].",
                            feedback_fail: "When the machine is OFF, it can't be called ON!"
                        },
                        {
                            title: "Initial State inside",
                            theory_text: "The diagram is missing an Initial Node. When the machine is just turned ON, should it be in the Paused or Playing state?",
                            interaction: { type: "composite_initial" },
                            feedback_success: "Correct!",
                            detailed_explanation: "When entering a Composite State, the system will look for the black Initial dot inside to know which sub-State to land on first.",
                            feedback_fail: "The black dot inside the frame should only point to the sub-States of that frame."
                        }
                    ]
                },
                {
                    id: "cp9",
                    title: "Lesson 9: Reading Comprehension & Simulation",
                    lessons: [
                        {
                            title: "Predicting 1 step ahead",
                            theory_text: "With the current variable: balance = 1. Click the CHOOSE_COLA Event and predict the outcome.",
                            interaction: { type: "predict_branch" },
                            feedback_success: "Correct!",
                            detailed_explanation: "Because balance < 2, the [balance < 2] Guard is triggered, and the system will follow the branch indicating insufficient funds.",
                            feedback_fail: "You have $1, and a Cola costs $2. The [balance < 2] Guard will be triggered."
                        },
                        {
                            title: "Combo Tracking",
                            theory_text: "The initial state is [Red]. The sequence of Events loaded is: [TIMER, TIMER, TIMER]. Select the final state.",
                            interaction: { type: "track_sequence" },
                            feedback_success: "Correct!",
                            detailed_explanation: "Red -> TIMER -> Green -> TIMER -> Yellow -> TIMER -> Red. The final state is Red.",
                            feedback_fail: "Calculate carefully. Click the Step-by-step button if you need help."
                        },
                        {
                            title: "Reverse Thinking",
                            theory_text: "How to get the microwave to change from [Door Open] to [Cooking]?",
                            interaction: { type: "sequence_builder" },
                            feedback_success: "Correct!",
                            detailed_explanation: "The system needs to close the door before you can press START to cook.",
                            feedback_fail: "The system has no START arrow when the door is open. The Event is ignored!"
                        }
                    ]
                },
                {
                    id: "cp10",
                    title: "Lesson 10: Logic Bug Catching",
                    lessons: [
                        {
                            title: "Dead End",
                            theory_text: "Try pressing the Turn Off button.",
                            interaction: { type: "blackhole_hook" },
                            feedback_success: "",
                            detailed_explanation: "A State that is not a Final State but has no outgoing Transition is called a 'Blackhole' or 'Dead End'.",
                            feedback_fail: "The Turn Off button doesn't work because there's no path!"
                        },
                        {
                            title: "Fix the Dead End",
                            theory_text: "Draw an arrow from [Pumping] back to [Off] to rescue the system.",
                            interaction: { type: "repair_blackhole" },
                            feedback_success: "Awesome! You saved the system from running endlessly.",
                            detailed_explanation: "Bug successfully patched.",
                            feedback_fail: "Connect an arrow from Pumping back to Off."
                        },
                        {
                            title: "Ambiguity Error",
                            theory_text: "When COIN_DROP occurs, the machine doesn't know whether to go to Heads or Tails. Attach a Guard to branch the path.",
                            interaction: { type: "repair_ambiguity" },
                            feedback_success: "Excellent!",
                            detailed_explanation: "Computer systems are dumb; they can't randomly choose if you draw 2 identical paths. You must attach a Guard to make it Deterministic.",
                            feedback_fail: "You must distribute Guards for both arrows."
                        },
                        {
                            title: "Multi-Bug Fix",
                            theory_text: "Identify and delete the 2 invalid arrows. Remember: There is only 1 starting point, and a Final State cannot transition to anywhere else.",
                            interaction: { type: "repair_multi" },
                            feedback_success: "Outstanding! You passed the bug fixing test.",
                            detailed_explanation: "Very good! Reviewing logic errors is an extremely important skill.",
                            feedback_fail: "There are still errors. Please check the Report table again."
                        }
                    ]
                },
                {
                    id: "cp11",
                    title: "Lesson 11: Boss Challenge",
                    lessons: [
                        {
                            title: "Accepting a Project",
                            theory_text: "Design a Vending Machine system. First, select the appropriate States for this system.",
                            interaction: { type: "boss_states" },
                            feedback_success: "Awesome! Now it's time for Wiring.",
                            detailed_explanation: "",
                            feedback_fail: "Does a vending machine need to sleep? Choose more realistic States."
                        },
                        {
                            title: "Wiring and Triggering",
                            theory_text: "Draw arrows and attach Events to create a complete diagram.",
                            interaction: { type: "boss_connect" },
                            feedback_success: "Perfect!",
                            detailed_explanation: "",
                            feedback_fail: "It seems your diagram is still flawed."
                        },
                        {
                            title: "Acceptance Testing",
                            theory_text: "Simulate buying 1 can of drink to test your diagram.",
                            interaction: { type: "boss_sim" },
                            feedback_success: "Congratulations! You've achieved the StateMaster Certified title!",
                            detailed_explanation: "The basic course is complete. You are ready to move on to advanced concepts.",
                            feedback_fail: ""
                        }
                    ]
                },
                {
                    id: "cp12",
                    title: "Lesson 12: Parallel States",
                    lessons: [
                        {
                            title: "Combinatorial Explosion",
                            theory_text: "If we add underline (U), the diagram balloons to 8 states. Do you want to draw more arrows?",
                            interaction: { type: "parallel_hook" },
                            feedback_success: "",
                            detailed_explanation: "Instead of creating every combination, we divide the diagram into independent parallel regions. These are called Parallel States.",
                            feedback_fail: ""
                        },
                        {
                            title: "Local Initial Node",
                            theory_text: "The system doesn't know where to start in each region.",
                            interaction: { type: "parallel_initial" },
                            feedback_success: "Excellent!",
                            detailed_explanation: "Each parallel region needs its own starting point.",
                            feedback_fail: "You must place an Initial Node for all regions."
                        },
                        {
                            title: "Local Event",
                            theory_text: "Press TOGGLE_BOLD. Which region will be affected?",
                            interaction: { type: "parallel_sim" },
                            feedback_success: "Awesome! Bolding does not affect the italics state.",
                            detailed_explanation: "An Event in one region only affects that region, making the statechart independent and scalable.",
                            feedback_fail: "Try pressing it again."
                        }
                    ]
                },
                {
                    id: "cp13",
                    title: "Lesson 13: History State",
                    lessons: [
                        {
                            title: "Amnesia",
                            theory_text: "Press Restore Network. The movie rewound to the beginning due to the Composite State's Initial Node.",
                            interaction: { type: "history_hook" },
                            feedback_success: "",
                            detailed_explanation: "Every time it re-enters the frame, the system starts over from Initial. What a disaster! We need it to remember its previous position.",
                            feedback_fail: ""
                        },
                        {
                            title: "Saving Past Milestones",
                            theory_text: "The diagram is using an Initial Node, causing the machine to always replay Song 1. Drag the History Node [ H ] and drop it over the Initial Node to save the song currently playing.",
                            interaction: { type: "history_attach" },
                            feedback_success: "Game Saved successfully! [ H ] is the History Node.",
                            detailed_explanation: "Next time you enter this State, [ H ] will remember and take you straight to the final sub-State that was active before being interrupted.",
                            feedback_fail: "You need to replace the Initial Node with the History Node."
                        },
                        {
                            title: "Interruption Simulation",
                            theory_text: "Press Start, then Power Outage, then Power Restored to verify.",
                            interaction: { type: "history_sim" },
                            feedback_success: "Awesome!",
                            detailed_explanation: "The system recovered perfectly without having to run again from the beginning.",
                            feedback_fail: "Try the buttons in order to see the magic."
                        }
                    ]
                },
                {
                    id: "cp14",
                    title: "Lesson 14: Timeout (Delayed Transition)",
                    lessons: [
                        {
                            title: "Manual Nuisance",
                            theory_text: "The OTP expired, but the system forces the user to manually click the 'Expired' button. Absurd, right?",
                            interaction: { type: "timeout_hook" },
                            feedback_success: "",
                            detailed_explanation: "The expiration must happen automatically after 60 seconds without forcing the user to manually click a button!",
                            feedback_fail: ""
                        },
                        {
                            title: "Trigger by Time",
                            theory_text: "Drag the [after 60s] label onto the arrow to automate it.",
                            interaction: { type: "timeout_attach" },
                            feedback_success: "Correct! This Transition will run automatically when time is up without any human intervention.",
                            detailed_explanation: "Delayed Transition (Timeout) is the core feature for all time-based behaviors.",
                            feedback_fail: "Drop the after 60s label onto the arrow."
                        },
                        {
                            title: "Autonomous Traffic Light",
                            theory_text: "Press the Start button to see how Timeout creates an eternal loop without human intervention (like a traffic light).",
                            interaction: { type: "timeout_loop" },
                            feedback_success: "Superb!",
                            detailed_explanation: "By chaining Timeout events (after 30s -> 5s -> 25s), the Statechart visually represents the system's autonomous cycle.",
                            feedback_fail: "The timing doesn't make sense, adjust the light phase durations!"
                        }
                    ]
                }
            ]
        },
        {
            id: "level2",
            title: "LEVEL 2: Coming Soon",
            checkpoints: []
        }
    ]
};


