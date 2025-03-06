"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const ExperimentPage = () => {
    return (
        <div className="flex flex-col min-h-screen relative">
            <nav className="border-b bg-background shadow-sm">
                <div className="container mx-auto flex h-16 justify-between items-center">
                    <div className="text-xl font-bold">QA App</div>
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <Link href="/" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Home
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/experiment" legacyBehavior passHref>
                                    <NavigationMenuLink className={cn(
                                        navigationMenuTriggerStyle(),
                                        "border-b-2 border-primary"
                                    )}>
                                        Experiment
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/questions" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Questions
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/profile" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Profile
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div>
                        <Button variant="default">Login</Button>
                    </div>
                </div>
            </nav>
            <div className="container p-10">
                <h1 className="text-2xl font-bold mb-4">Experiment Page</h1>
                <p>This is the experiment page content.</p>
                
                {/* Table with random data in the middle of the screen */}
                <div className="flex justify-center my-10">
                    <div className="border rounded-lg overflow-hidden shadow-md">
                        <table className="min-w-[500px] divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">John Doe</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Developer</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Engineering</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">86</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Jane Smith</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Designer</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Product</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">92</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Michael Johnson</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Manager</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Operations</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">78</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sarah Williams</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Analyst</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Finance</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">95</td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
            
            {/* Floating button positioned in the center of the screen */}
            {/* Home return button */}
            <Button 
                variant="secondary" 
                className="fixed bottom-8 right-8 shadow-lg"
                onClick={() => {
                    console.log("return home");
                    window.location.href = "/";
                }}
            >
                Click to return home
            </Button>


        </div>
    );
};

export default ExperimentPage;
