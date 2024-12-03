
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


export default function Nebrija_DashboardPage() {
    return (
        <div className="mx-5">
            <Card className="w-[350px] h-[420px]">
                <CardHeader>
                    <CardTitle>Inventario total</CardTitle>
                    <CardDescription>
                        Aquí se encuentra la cantidad y valor estimado de los activos del espacio.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Categoría</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">Valor est.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Dispositivos</TableCell>
                                <TableCell className="text-right">4</TableCell>
                                <TableCell className="text-right">3600€</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Activos digitales</TableCell>
                                <TableCell className="text-right">10</TableCell>
                                <TableCell className="text-right">4000€</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Materiales</TableCell>
                                <TableCell className="text-right">250</TableCell>
                                <TableCell className="text-right">2500€</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableHead className="w-[100px]">Total</TableHead>
                                <TableHead className="text-right">264</TableHead>
                                <TableHead className="text-right">10.100€</TableHead>
                            </TableRow>
                        </TableFooter>
                    </Table>

                </CardContent>
            </Card>
        </div>
    )
}